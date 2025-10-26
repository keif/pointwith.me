// Theirs
import React, {useEffect, useState} from 'react';
import {format} from 'date-fns';
import {Lock, Unlock, Trophy, X, Users, Eye, UserCheck, RefreshCw, Edit2, Check} from 'lucide-react';
import toast from 'react-hot-toast';

// Ours
import {auth, db} from '../../firebase';
import * as issues from '../../api/issues';
import {formatEditHistory} from '../../utils/timeAgo';
import Layout from '../../containers/Layout';
import Issue from '../Issue';
import withAuthentication from '../../containers/withAuthentication';
import {useParams} from 'react-router-dom';
import {child, onValue, set, update, onDisconnect, remove} from 'firebase/database';
import shortid from 'shortid';
import IssueCreator from './IssueCreator';
import ModalActions from './ModalActions';
import RoleSelectionModal from './RoleSelectionModal';
import ConfirmDialog from '../common/ConfirmDialog';
import * as dbRefs from '../../firebase/db';


const PokerTable = () => {
	const {userId, tableId} = useParams();
	const currentUser = auth.auth.currentUser;
	const issuesClient = issues.createClient(
		userId,  // Use table owner's ID from URL, not current user
		tableId
	);
	const [state, setState] = React.useState({
		pokerTable: {} as any,
		issuesClient: null,
		issues: [],
		currentIssue: false,
		nextIssue: false,
		participants: [],
	});
	const [userRole, setUserRole] = React.useState(null);
	const [showRoleModal, setShowRoleModal] = React.useState(true);
	const [editingIssueId, setEditingIssueId] = useState(null);
	const [editedIssueTitle, setEditedIssueTitle] = useState('');
	const [deleteConfirmation, setDeleteConfirmation] = useState({
		isOpen: false,
		issueId: null,
		issueName: '',
	});
	const pokerTableRef = db.pokerTable(userId, tableId);
	const ptIssuesRef = db.pokerTableIssuesRoot(
		userId,  // Use table owner's ID from URL, not current user
		tableId
	);

	useEffect(() => {
		loadPokerTable();

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
		const participantsRef = dbRefs.pokerTableParticipants(userId, tableId);
		const currentParticipantRef = dbRefs.pokerTableParticipant(userId, tableId, currentUser.uid);

		// Add current user to participants
		const participantData = {
			uid: currentUser.uid,
			displayName: currentUser.displayName || 'Anonymous',
			joinedAt: new Date().toISOString(),
			isHost: userId === currentUser.uid,
			role: userRole,
		};

		set(currentParticipantRef, participantData)
			.catch((error) => console.error('Error adding participant:', error));

		// Remove on disconnect
		onDisconnect(currentParticipantRef).remove();

		// Listen to participant changes
		onValue(participantsRef, (snapshot) => {
			if (snapshot.exists()) {
				const participantsData = snapshot.val();
				const participantsList = Object.keys(participantsData).map(key => ({
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

	const handleSelectRole = (role) => {
		setUserRole(role);
		setShowRoleModal(false);
		localStorage.setItem(`pokerRole_${tableId}`, role);
		toast.success(`Joined as ${role === 'voter' ? 'Voter' : 'Spectator'}`);
	};

	const handleToggleRole = () => {
		const newRole = userRole === 'voter' ? 'spectator' : 'voter';
		const currentParticipantRef = dbRefs.pokerTableParticipant(userId, tableId, currentUser.uid);

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

	const handleCreateIssue = (newIssueName) => {
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
		).then(() => loadPokerTable());
	};

	const removeIssue = (issueId) => (e) => {
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

	const performDeleteIssue = (issueId, issueName) => {
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

	const handleViewIssue = async (currentIssue) => {
		update(pokerTableRef, {currentIssue: false})
			.then(() => {
				if (userId !== currentUser.uid) {
					return;
				}
				update(pokerTableRef, {currentIssue});
			});
	};

	const getNextIssue = (currentIssue, issuesList) => {
		let nextIssue = false;
		issuesList.forEach((issue, i) => {
			if (issue.id === currentIssue) {
				nextIssue = issuesList[i + 1];
			}
		});

		return nextIssue ? (nextIssue as any).id : false;
	};

	const handleCloseIssue = async () => {
		await update(pokerTableRef, {currentIssue: false})
			.catch((error) => {
				toast.error('Failed to close issue: ' + error.message);
			});
	};

	const handleStartEditIssue = (issueId, currentTitle) => (e) => {
		e.stopPropagation(); // Prevent triggering handleViewIssue
		setEditingIssueId(issueId);
		setEditedIssueTitle(currentTitle);
	};

	const handleCancelEditIssue = (e) => {
		e.stopPropagation();
		setEditingIssueId(null);
		setEditedIssueTitle('');
	};

	const handleSaveEditIssue = (issueId) => (e) => {
		e.stopPropagation();
		const trimmedTitle = editedIssueTitle.trim();

		if (!trimmedTitle) {
			toast.error('Issue title cannot be empty');
			return;
		}
		if (trimmedTitle.length > 200) {
			toast.error('Issue title must be 200 characters or less');
			return;
		}

		const issueRef = db.pokerTableIssue(userId, tableId, issueId);
		const updateData = {
			title: trimmedTitle,
			lastEdited: new Date().toISOString(),
			lastEditedBy: currentUser.uid,
			lastEditedByName: currentUser.displayName || 'Anonymous',
		};

		toast.promise(
			update(issueRef, updateData),
			{
				loading: 'Updating issue title...',
				success: 'Issue title updated',
				error: 'Failed to update issue title',
			}
		).then(() => {
			setEditingIssueId(null);
			setEditedIssueTitle('');
		}).catch(() => {
			// Error handled by toast
		});
	};

	const handleIssueKeyDown = (issueId) => (e) => {
		if (e.key === 'Enter') {
			handleSaveEditIssue(issueId)(e);
		} else if (e.key === 'Escape') {
			handleCancelEditIssue(e);
		}
	};

	const loadPokerTable = () => {
		onValue(pokerTableRef, (snapshot) => {
			if (snapshot.exists()) {
				const table = snapshot.val();
				const newIssuesList = [];
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

				const nextIssue = getNextIssue(table.currentIssue, newIssuesList);
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
					/>
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
								const isCurrentUser = participant.id === currentUser.uid;
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
											value={editedIssueTitle}
											onChange={(e) => setEditedIssueTitle(e.target.value)}
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
												{userId === currentUser.uid && (
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

										{/* Only show the delete action if the authenticated user is the owner. */}
										{userId === currentUser.uid && (
											<button
												data-testid="delete-issue-button"
												onClick={removeIssue(s.id)}
												className="ml-4 p-2 text-danger hover:bg-red-50 rounded transition-colors"
												aria-label="Delete issue"
											>
												<X size={20} />
											</button>
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
							<Issue issue={state.currentIssue} participants={state.participants} userRole={userRole} onToggleRole={handleToggleRole} />
						</div>
						{(userId === currentUser.uid) && (
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
		</Layout>
	);
};

export default withAuthentication(PokerTable);

// Export PokerTable without the withAuthentication HOC for testing
export {PokerTable};