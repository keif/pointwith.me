// Theirs
import React, {useEffect} from 'react';
import {format} from 'date-fns';
import {Lock, Unlock, Trophy, X, Users} from 'lucide-react';
import toast from 'react-hot-toast';

// Ours
import {auth, db} from '../../firebase';
import * as issues from '../../api/issues';
import Layout from '../../containers/Layout';
import Issue from '../Issue';
import withAuthentication from '../../containers/withAuthentication';
import {useParams} from 'react-router-dom';
import {child, onValue, set, update, onDisconnect, remove} from 'firebase/database';
import shortid from 'shortid';
import IssueCreator from './IssueCreator';
import ModalActions from './ModalActions';
import * as dbRefs from '../../firebase/db';


const PokerTable = () => {
	const {userId, tableId} = useParams();
	const currentUser = auth.auth.currentUser;
	const issuesClient = issues.createClient(
		userId,  // Use table owner's ID from URL, not current user
		tableId
	);
	const [state, setState] = React.useState({
		pokerTable: {},
		issuesClient: null,
		issues: [],
		currentIssue: false,
		nextIssue: false,
		participants: [],
	});
	const pokerTableRef = db.pokerTable(userId, tableId);
	const ptIssuesRef = db.pokerTableIssuesRoot(
		userId,  // Use table owner's ID from URL, not current user
		tableId
	);

	useEffect(() => {
		loadPokerTable();
		setupParticipantTracking();
	}, []);

	const setupParticipantTracking = () => {
		const participantsRef = dbRefs.pokerTableParticipants(userId, tableId);
		const currentParticipantRef = dbRefs.pokerTableParticipant(userId, tableId, currentUser.uid);

		// Add current user to participants
		const participantData = {
			uid: currentUser.uid,
			displayName: currentUser.displayName || 'Anonymous',
			joinedAt: new Date().toISOString(),
			isHost: userId === currentUser.uid,
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

	const handleCreateIssue = (newIssueName) => {
		const uid = shortid.generate();
		const data = {
			title: newIssueName,
			created: new Date().toISOString(),
			score: 0,
			votes: {},
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

		const issue = state.issues.find(i => i.id === issueId);
		const issueName = issue?.title || 'Issue';

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

		return nextIssue ? nextIssue.id : false;
	};

	const handleCloseIssue = async () => {
		await update(pokerTableRef, {currentIssue: false})
			.catch((error) => {
				toast.error('Failed to close issue: ' + error.message);
			});
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
										className={`flex items-center gap-2 p-3 rounded-lg ${
											isCurrentUser
												? 'bg-primary bg-opacity-10 border-2 border-primary'
												: 'bg-gray-50'
										}`}
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
											{participant.isHost && (
												<p className="text-xs text-primary font-medium">HOST</p>
											)}
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
							<div key={s.id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors">
								<div
									onClick={() => handleViewIssue(s.id)}
									role="button"
									className="flex-1 cursor-pointer"
								>
									<div className="flex items-center gap-2 mb-1">
										{s.isLocked ? <Lock size={16} className="text-gray-500" /> : <Unlock size={16} className="text-gray-500" />}
										<h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
										{s.finalScore !== null && s.finalScore !== undefined && (
											<>
												<Trophy size={16} className="text-warning" />
												<span className="text-success font-bold">
													{s.finalScore}
												</span>
											</>
										)}
									</div>
									{s.created && (
										<p className="text-sm text-gray-500">
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
							</div>
						)) : (
							<p className="text-gray-500 text-center py-8">No Issues Returned</p>
						)}
					</div>
				</div>
			</div>

			{/* Modal */}
			{!!state.currentIssue && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16 overflow-y-auto">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 mb-16">
						<div className="p-6">
							<Issue issue={state.currentIssue} participants={state.participants} />
						</div>
						{(userId === currentUser.uid) && (
							<ModalActions nextIssue={state.nextIssue} onClose={handleCloseIssue} onNext={handleViewIssue} />
						)}
					</div>
				</div>
			)}
		</Layout>
	);
};

export default withAuthentication(PokerTable);

// Export PokerTable without the withAuthentication HOC for testing
export {PokerTable};