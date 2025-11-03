// Theirs
import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import {Lock, Unlock, Trophy, X, Users, Eye, UserCheck, RefreshCw, Edit2, Check, Download, ExternalLink, Upload, CheckCircle, AlertCircle} from 'lucide-react';
import toast from 'react-hot-toast';

// Ours
import {auth, db} from '@/firebase';
import * as issues from '@/api/issues';
import {formatEditHistory} from '@/utils/timeAgo';
import Layout from '@/containers/Layout';
import Issue from '../Issue';
import withAuthentication from '@/containers/withAuthentication';
import {useParams} from 'react-router-dom';
import {child, onValue, set, update, onDisconnect, remove} from 'firebase/database';
import shortid from 'shortid';
import IssueCreator from './IssueCreator';
import ModalActions from './ModalActions';
import RoleSelectionModal from './RoleSelectionModal';
import ConfirmDialog from '../common/ConfirmDialog';
import JiraImportModal from '../Dashboard/JiraImportModal';
import * as dbRefs from '@/firebase/db';
import {useInlineEdit} from '@/hooks/useInlineEdit';
import {useJiraAuth} from '@/hooks/useJiraAuth';
import {batchUpdateStoryPoints} from '@/services/jira';
import type { ParticipantRole } from '@/types';
import type { JiraIssue } from '@/types/jira';

interface PokerTableIssue {
  id: string;
  title: string;
  created: string;
  isLocked: boolean;
  showVotes: boolean;
  finalScore: number | null;
  lastEdited?: string;
  lastEditedBy?: string;
  lastEditedByName?: string;
  jiraKey?: string;
  jiraId?: string;
  jiraUrl?: string;
  timer?: {
    isActive: boolean;
    startedAt?: string;
    remainingSeconds?: number;
  };
}

interface TableParticipant {
  id: string;
  uid: string;
  displayName: string;
  joinedAt: string;
  isHost: boolean;
  role: ParticipantRole;
}

interface PokerTableVotingScale {
  type: 'fibonacci' | 'tshirt' | 'powers-of-2' | 'linear' | 'custom';
  customValues?: string;
}

interface PokerTableState {
  pokerTable: {
    tableName?: string;
    ownerName?: string;
    created?: string;
    lastEdited?: string;
    lastEditedByName?: string;
    currentIssue?: string | boolean;
    issueModal?: boolean;
    issues?: Record<string, PokerTableIssue>;
    votingScale?: PokerTableVotingScale;
    timerSettings?: {
      enabled: boolean;
      duration: number;
      onExpire?: 'justStop' | 'lockVoting' | 'autoReveal';
    };
  };
  issuesClient: null;
  issues: PokerTableIssue[];
  currentIssue: string | boolean;
  nextIssue: string | boolean;
  participants: TableParticipant[];
}


const PokerTable = () => {
	const {userId, tableId} = useParams<{ userId: string; tableId: string }>();
	const currentUser = auth.auth.currentUser;
	const issuesClient = issues.createClient(
		userId!,  // Use table owner's ID from URL, not current user
		tableId!
	);
	const [state, setState] = React.useState<PokerTableState>({
		pokerTable: {},
		issuesClient: null,
		issues: [],
		currentIssue: false,
		nextIssue: false,
		participants: [],
	});
	const [userRole, setUserRole] = React.useState<ParticipantRole | null>(null);
	const [showRoleModal, setShowRoleModal] = React.useState(true);
	const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
	const [editingIssueTitle, setEditingIssueTitle] = useState('');
	const [isJiraImportOpen, setIsJiraImportOpen] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const { isConnected, getValidConfig } = useJiraAuth();
	const [deleteConfirmation, setDeleteConfirmation] = useState<{
		isOpen: boolean;
		issueId: string | null;
		issueName: string;
	}>({
		isOpen: false,
		issueId: null,
		issueName: '',
	});
	const pokerTableRef = db.pokerTable(userId!, tableId!);
	const ptIssuesRef = db.pokerTableIssuesRoot(
		userId!,  // Use table owner's ID from URL, not current user
		tableId!
	);

	useEffect(() => {
		loadPokerTable();

		// If current user is the host (table owner), automatically set them as voter
		const isHost = currentUser && userId === currentUser.uid;
		if (isHost) {
			setUserRole('voter');
			setShowRoleModal(false);
			localStorage.setItem(`pokerRole_${tableId}`, 'voter');
			return;
		}

		// Check localStorage for saved role preference for this table
		const savedRole = localStorage.getItem(`pokerRole_${tableId}`);
		if (savedRole === 'voter' || savedRole === 'spectator') {
			setUserRole(savedRole);
			setShowRoleModal(false);
		}
	}, []);

	useEffect(() => {
		if (userRole) {
			const cleanup = setupParticipantTracking();
			return cleanup;
		}
	}, [userRole]);

	const setupParticipantTracking = () => {
		if (!currentUser) return () => {};

		const participantsRef = dbRefs.pokerTableParticipants(userId!, tableId!);
		const currentParticipantRef = dbRefs.pokerTableParticipant(userId!, tableId!, currentUser.uid);

		// Add current user to participants
		const participantData = {
			uid: currentUser.uid,
			displayName: currentUser.displayName || 'Anonymous',
			joinedAt: new Date().toISOString(),
			isHost: userId === currentUser.uid,
			role: userRole,
		};

		set(currentParticipantRef, participantData)
			.then(() => {
				// Update table lastActivity when user joins
				updateLastActivity();
			})
			.catch((error) => console.error('Error adding participant:', error));

		// Remove on disconnect
		onDisconnect(currentParticipantRef).remove();

		// Listen to participant changes
		onValue(participantsRef, (snapshot) => {
			if (snapshot.exists()) {
				const participantsData = snapshot.val() as Record<string, Omit<TableParticipant, 'id'>>;
				const participantsList: TableParticipant[] = Object.keys(participantsData).map(key => ({
					...participantsData[key],
					id: key,
				}));
				// Sort: host first, then by join time
				participantsList.sort((a, b) => {
					if (a.isHost && !b.isHost) return -1;
					if (!a.isHost && b.isHost) return 1;
					return a.joinedAt > b.joinedAt ? 1 : -1;
				});
				setState(prevState => ({
					...prevState,
					participants: participantsList,
				}));
			} else {
				setState(prevState => ({
					...prevState,
					participants: [],
				}));
			}
		});

		// Cleanup on unmount
		return () => {
			remove(currentParticipantRef)
				.catch((error) => console.error('Error removing participant:', error));
		};
	};

	const handleSelectRole = (role: ParticipantRole) => {
		setUserRole(role);
		setShowRoleModal(false);
		localStorage.setItem(`pokerRole_${tableId}`, role);
		toast.success(`Joined as ${role === 'voter' ? 'Voter' : 'Spectator'}`);
	};

	const handleToggleRole = () => {
		if (!currentUser) return;

		const newRole: ParticipantRole = userRole === 'voter' ? 'spectator' : 'voter';
		const currentParticipantRef = dbRefs.pokerTableParticipant(userId!, tableId!, currentUser.uid);

		update(currentParticipantRef, {role: newRole})
			.then(() => {
				setUserRole(newRole);
				localStorage.setItem(`pokerRole_${tableId}`, newRole);
				toast.success(`Switched to ${newRole === 'voter' ? 'Voter' : 'Spectator'}`);
			})
			.catch((error) => {
				toast.error('Failed to switch role: ' + error.message);
			});
	};

	const handleCreateIssue = (newIssueName: string) => {
		const uid = shortid.generate();
		const data = {
			title: newIssueName,
			created: new Date().toISOString(),
			isLocked: false,
			showVotes: false,
			finalScore: null,
		};
		toast.promise(
			update(child(ptIssuesRef, uid), data),
			{
				loading: 'Creating issue...',
				success: `Created: ${newIssueName}`,
				error: 'Failed to create issue',
			}
		).then(() => {
			updateLastActivity();
			loadPokerTable();
		});
	};

	const handleImportFromJira = (jiraIssues: JiraIssue[]) => {
		if (jiraIssues.length === 0) return;

		const issuesData: Record<string, any> = {};
		jiraIssues.forEach((jiraIssue) => {
			const issueId = shortid.generate();
			issuesData[issueId] = {
				title: `${jiraIssue.key}: ${jiraIssue.summary}`,
				created: new Date().toISOString(),
				isLocked: false,
				showVotes: false,
				finalScore: jiraIssue.storyPoints || null,
				jiraKey: jiraIssue.key,
				jiraId: jiraIssue.id,
				jiraUrl: jiraIssue.jiraUrl,
			};
		});

		toast.promise(
			update(ptIssuesRef, issuesData),
			{
				loading: 'Importing issues...',
				success: `Imported ${jiraIssues.length} ${jiraIssues.length === 1 ? 'issue' : 'issues'}`,
				error: 'Failed to import issues',
			}
		).then(() => {
			updateLastActivity();
			loadPokerTable();
		});
	};

	const handleBatchSyncToJira = async () => {
		// Get all issues that have Jira metadata and a final score
		const issuesToSync = state.issues.filter(
			issue => issue.jiraKey && issue.jiraId && issue.finalScore !== null && issue.finalScore !== undefined
		);

		if (issuesToSync.length === 0) {
			toast.error('No issues with story points to sync');
			return;
		}

		const config = await getValidConfig();
		if (!config) {
			toast.error('Jira connection not available');
			return;
		}

		if (!config.storyPointsFieldId) {
			toast.error('Story points field not configured. Please configure it in settings.');
			return;
		}

		setIsSyncing(true);

		const updates = issuesToSync.map(issue => ({
			issueKey: issue.jiraKey!,
			points: issue.finalScore,
		}));

		try {
			const result = await batchUpdateStoryPoints(
				config.cloudId,
				config.accessToken,
				config.storyPointsFieldId,
				updates
			);

			if (result.failed > 0) {
				toast.error(
					`Synced ${result.successful} of ${result.total} issues. ${result.failed} failed.`,
					{ duration: 5000 }
				);
				console.error('Failed syncs:', result.results.filter(r => !r.success));
			} else {
				toast.success(`Successfully synced ${result.successful} ${result.successful === 1 ? 'issue' : 'issues'} to Jira`);
			}
		} catch (error) {
			console.error('Batch sync error:', error);
			toast.error('Failed to sync story points to Jira');
		} finally {
			setIsSyncing(false);
		}
	};

	const handleSyncSingleIssue = (issue: PokerTableIssue) => async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!issue.jiraKey || !issue.jiraId) {
			toast.error('Issue is not linked to Jira');
			return;
		}

		if (issue.finalScore === null || issue.finalScore === undefined) {
			toast.error('Issue does not have a story point estimate');
			return;
		}

		const config = await getValidConfig();
		if (!config) {
			toast.error('Jira connection not available');
			return;
		}

		if (!config.storyPointsFieldId) {
			toast.error('Story points field not configured. Please configure it in settings.');
			return;
		}

		const toastId = toast.loading(`Syncing ${issue.jiraKey}...`);

		try {
			const result = await batchUpdateStoryPoints(
				config.cloudId,
				config.accessToken,
				config.storyPointsFieldId,
				[{ issueKey: issue.jiraKey, points: issue.finalScore }]
			);

			if (result.successful > 0) {
				toast.success(`Successfully synced ${issue.jiraKey}`, { id: toastId });
			} else {
				const errorMessage = result.results[0]?.error || 'Unknown error';
				toast.error(`Failed to sync ${issue.jiraKey}: ${errorMessage}`, { id: toastId, duration: 5000 });
			}
		} catch (error) {
			console.error('Single sync error:', error);
			toast.error(`Failed to sync ${issue.jiraKey}`, { id: toastId });
		}
	};

	const removeIssue = (issueId: string) => (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const issue = state.issues.find(i => i.id === issueId);
		const issueName = issue?.title || 'Issue';

		// Check if user has disabled confirmation
		const skipConfirmation = localStorage.getItem('skipDeleteIssueConfirmation') === 'true';

		if (skipConfirmation) {
			performDeleteIssue(issueId, issueName);
		} else {
			setDeleteConfirmation({
				isOpen: true,
				issueId,
				issueName,
			});
		}
	};

	const performDeleteIssue = (issueId: string | null, issueName: string) => {
		if (!issueId) return;

		// Optimistically update UI
		const filteredIssues = state.issues.filter(({id}) => id !== issueId);
		setState(prevState => ({
			...prevState,
			issues: filteredIssues,
		}));

		// Delete from Firebase
		toast.promise(
			issuesClient.remove(issueId),
			{
				loading: 'Deleting issue...',
				success: `Deleted: ${issueName}`,
				error: (err) => {
					// Revert on error
					loadPokerTable();
					return 'Failed to delete issue';
				},
			}
		);
	};

	const handleConfirmDelete = () => {
		const {issueId, issueName} = deleteConfirmation;
		performDeleteIssue(issueId, issueName);
		setDeleteConfirmation({ isOpen: false, issueId: null, issueName: '' });
	};

	const handleCancelDelete = () => {
		setDeleteConfirmation({ isOpen: false, issueId: null, issueName: '' });
	};

	const handleViewIssue = async (currentIssue: string | boolean) => {
		if (!currentUser) return;

		update(pokerTableRef, {currentIssue: false})
			.then(() => {
				if (userId !== currentUser.uid) {
					return;
				}
				update(pokerTableRef, {currentIssue});
			});
	};

	const getNextIssue = (currentIssue: string | boolean, issuesList: PokerTableIssue[]): string | boolean => {
		let nextIssue: PokerTableIssue | undefined;
		issuesList.forEach((issue, i) => {
			if (issue.id === currentIssue) {
				nextIssue = issuesList[i + 1];
			}
		});

		return nextIssue?.id || false;
	};

	const handleCloseIssue = async () => {
		await update(pokerTableRef, {currentIssue: false})
			.catch((error) => {
				toast.error('Failed to close issue: ' + error.message);
			});
	};

	const handleStartEditIssue = (issueId: string, currentTitle: string) => (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering handleViewIssue
		setEditingIssueId(issueId);
		setEditingIssueTitle(currentTitle);
	};

	const handleCancelEditIssue = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		setEditingIssueId(null);
		setEditingIssueTitle('');
	};

	const handleSaveEditIssue = (issueId: string) => async (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		if (!currentUser) return;

		const trimmedTitle = editingIssueTitle.trim();

		if (!trimmedTitle) {
			toast.error('Issue title cannot be empty');
			return;
		}
		if (trimmedTitle.length > 200) {
			toast.error('Issue title must be 200 characters or less');
			return;
		}

		const issueRef = db.pokerTableIssue(userId!, tableId!, issueId);
		const updateData = {
			title: trimmedTitle,
			lastEdited: new Date().toISOString(),
			lastEditedBy: currentUser.uid,
			lastEditedByName: currentUser.displayName || 'Anonymous',
		};

		try {
			await toast.promise(
				update(issueRef, updateData),
				{
					loading: 'Updating issue title...',
					success: 'Issue title updated',
					error: 'Failed to update issue title',
				}
			);
			setEditingIssueId(null);
			setEditingIssueTitle('');
		} catch (error) {
			// Error handled by toast
		}
	};

	const handleIssueKeyDown = (issueId: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSaveEditIssue(issueId)(e);
		} else if (e.key === 'Escape') {
			handleCancelEditIssue(e);
		}
	};

	const updateLastActivity = () => {
		update(pokerTableRef, {
			lastActivity: new Date().toISOString()
		}).catch((error) => console.error('Error updating lastActivity:', error));
	};

	const loadPokerTable = () => {
		onValue(pokerTableRef, (snapshot) => {
			if (snapshot.exists()) {
				const table = snapshot.val() as PokerTableState['pokerTable'];
				const newIssuesList: PokerTableIssue[] = [];
				for (let issue in table.issues) {
					newIssuesList.push({
						...table.issues[issue],
						id: issue,
					});
				}
				newIssuesList.sort((i1, i2) => {
					if (i1.created > i2.created) return -1;
					if (i2.created > i1.created) return 1;
					return 0;
				});

				const nextIssue = getNextIssue(table.currentIssue || false, newIssuesList);
				setState(prevState => ({
					...prevState,
					pokerTable: table,
					issues: newIssuesList,
					issueModal: table.issueModal || false,
					currentIssue: table.currentIssue || false,
					nextIssue,
				}));
			}
		});
	};

	return (
		<Layout>
			<div className="space-y-6">
				{/* Issue Creator */}
				<div className="card">
					<IssueCreator
						onClick={handleCreateIssue}
						tableName={state.pokerTable.tableName}
						ownerName={state.pokerTable.ownerName}
						created={state.pokerTable.created}
						lastEdited={state.pokerTable.lastEdited}
						lastEditedByName={state.pokerTable.lastEditedByName}
						votingScale={state.pokerTable.votingScale}
						timerSettings={state.pokerTable.timerSettings}
					/>

				{/* Import from Jira Button */}
				{isConnected && (
					<div className="mt-4 pt-4 border-t border-gray-200">
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setIsJiraImportOpen(true)}
								className="btn btn-secondary flex items-center gap-2"
							>
								<Download size={16} />
								Import from Jira
							</button>
							<button
								onClick={handleBatchSyncToJira}
								disabled={isSyncing || state.issues.filter(i => i.jiraKey && i.finalScore !== null).length === 0}
								className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								title={state.issues.filter(i => i.jiraKey && i.finalScore !== null).length === 0 ? 'No issues with story points to sync' : 'Push all story points to Jira (only updates story points field)'}
							>
								{isSyncing ? (
									<RefreshCw size={16} className="animate-spin" />
								) : (
									<Upload size={16} />
								)}
								{isSyncing ? 'Syncing...' : 'Push All to Jira'}
							</button>
						</div>
					</div>
				)}
				</div>

				{/* Active Participants */}
				{state.participants.length > 0 && (
					<div className="card">
						<div className="flex items-center gap-2 mb-4">
							<Users size={20} className="text-primary" />
							<h2 className="text-xl font-bold">
								Active Participants ({state.participants.length})
							</h2>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
							{state.participants.map((participant) => {
								const isCurrentUser = currentUser && participant.id === currentUser.uid;
								return (
									<div
										key={participant.id}
										onClick={isCurrentUser ? handleToggleRole : undefined}
										className={`flex items-center gap-2 p-3 rounded-lg ${
											isCurrentUser
												? 'bg-primary bg-opacity-10 border-2 border-primary cursor-pointer hover:bg-primary hover:bg-opacity-20 transition-colors'
												: 'bg-gray-50'
										}`}
										title={isCurrentUser ? 'Click to toggle role' : ''}
									>
										<div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
											isCurrentUser ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-primary text-white'
										}`}>
											{participant.displayName.charAt(0).toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{participant.displayName}
												{isCurrentUser && <span className="text-primary font-bold ml-1">(You)</span>}
											</p>
											<div className="flex gap-2">
												{participant.isHost && (
													<p className="text-xs text-primary font-medium">HOST</p>
												)}
												{participant.role === 'spectator' && (
													<p className="text-xs text-gray-600 font-medium flex items-center gap-1">
														<Eye size={12} />
														SPECTATOR
													</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Issues List */}
				<div className="card">
					<h1 className="text-3xl font-bold mb-6">Table Issues</h1>
					<div className="divide-y divide-gray-200">
						{state.issues.length > 0 ? state.issues.map((s) => (
							<div key={s.id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors group">
								{editingIssueId === s.id ? (
									// Edit Mode
									<div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
										<input
											type="text"
											value={editingIssueTitle}
											onChange={(e) => setEditingIssueTitle(e.target.value)}
											onKeyDown={handleIssueKeyDown(s.id)}
											className="flex-1 text-lg font-semibold border-2 border-primary rounded px-2 py-1"
											autoFocus
											maxLength={200}
										/>
										<button
											onClick={handleSaveEditIssue(s.id)}
											className="p-2 bg-success text-white rounded hover:bg-green-600 transition-colors"
											title="Save"
										>
											<Check size={18} />
										</button>
										<button
											onClick={handleCancelEditIssue}
											className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
											title="Cancel"
										>
											<X size={18} />
										</button>
									</div>
								) : (
									// View Mode
									<>
										<div
											onClick={() => handleViewIssue(s.id)}
											role="button"
											className="flex-1 cursor-pointer"
										>
											<div className="flex items-center gap-2 mb-1">
												{s.isLocked ? <Lock size={16} className="text-gray-500" /> : <Unlock size={16} className="text-gray-500" />}
												<h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
												{s.jiraUrl && (
													<a
														href={s.jiraUrl}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
														className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
														title={`Open ${s.jiraKey} in Jira`}
													>
														<ExternalLink size={16} />
													</a>
												)}
												{currentUser && userId === currentUser.uid && (
													<button
														onClick={handleStartEditIssue(s.id, s.title)}
														className="p-1 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
														title="Edit issue title"
													>
														<Edit2 size={16} />
													</button>
												)}
												{s.finalScore !== null && s.finalScore !== undefined && (
													<>
														<Trophy size={16} className="text-warning" />
														<span className="text-success font-bold">
															{s.finalScore}
														</span>
													</>
												)}
											</div>
											<div className="text-sm text-gray-500">
												{s.created && (
													<p>
														Created: {(() => {
															try {
																const date = new Date(s.created);
																return isNaN(date.getTime()) ? 'Unknown' : format(date, 'MM/dd/yyyy hh:mm a');
															} catch (e) {
																return 'Unknown';
															}
														})()}
													</p>
												)}
												{s.lastEdited && s.lastEditedByName && (
													<p className="text-xs text-gray-400 italic mt-1">
														{formatEditHistory({
															lastEditedByName: s.lastEditedByName,
															lastEdited: s.lastEdited
														})}
													</p>
												)}
											</div>
										</div>

										{/* Action buttons for owner */}
										{currentUser && userId === currentUser.uid && (
											<div className="ml-4 flex items-center gap-2">
												{/* Sync button - show if issue has Jira link and final score */}
												{s.jiraKey && s.finalScore !== null && s.finalScore !== undefined && isConnected && (
													<button
														onClick={handleSyncSingleIssue(s)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
														aria-label="Sync to Jira"
														title={`Push story points to ${s.jiraKey} (only updates story points field)`}
													>
														<Upload size={20} />
													</button>
												)}
												<button
													data-testid="delete-issue-button"
													onClick={removeIssue(s.id)}
													className="p-2 text-danger hover:bg-red-50 rounded transition-colors"
													aria-label="Delete issue"
												>
													<X size={20} />
												</button>
											</div>
										)}
									</>
								)}
							</div>
						)) : (
							<p className="text-gray-500 text-center py-8">No Issues Returned</p>
						)}
					</div>
				</div>
			</div>

			{/* Modal */}
			{!!state.currentIssue && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 mb-8">
						<div className="p-4">
							<Issue
								issue={state.currentIssue}
								participants={state.participants as any}
								userRole={userRole ?? 'spectator'}
								onToggleRole={handleToggleRole}
								onActivity={updateLastActivity}
								votingScale={state.pokerTable.votingScale}
								timerSettings={state.pokerTable.timerSettings}
							/>
						</div>
						{currentUser && (userId === currentUser.uid) && (
							<ModalActions nextIssue={state.nextIssue} onClose={handleCloseIssue} onNext={handleViewIssue} />
						)}
					</div>
				</div>
			)}

			{/* Role Selection Modal */}
			{showRoleModal && (
				<RoleSelectionModal onSelectRole={handleSelectRole} />
			)}

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteConfirmation.isOpen}
				title="Delete Issue"
				message={`Are you sure you want to delete "${deleteConfirmation.issueName}"? This action cannot be undone.`}
				confirmText="Delete Issue"
				cancelText="Cancel"
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				showDontAskAgain={true}
				dontAskAgainKey="skipDeleteIssueConfirmation"
			/>

			{/* Jira Import Modal */}
			<JiraImportModal
				isOpen={isJiraImportOpen}
				onClose={() => setIsJiraImportOpen(false)}
				onImport={handleImportFromJira}
			/>
		</Layout>
	);
};

export default withAuthentication(PokerTable);

// Export PokerTable without the withAuthentication HOC for testing
export {PokerTable};
