import React, {useEffect, useState} from 'react';
import {Trophy, Loader2, CheckCircle, Circle, Eye} from 'lucide-react';
import toast from 'react-hot-toast';
import {auth, db} from '../../firebase';
import './issue.css';
import {useParams} from 'react-router-dom';
import {child, onValue, update} from 'firebase/database';
import VotingBlock from './VotingBlock';
import Controls from './Controls';

const Issue = ({issue, participants = [], userRole = 'voter', onToggleRole}) => {
	const {userId, tableId} = useParams();
	const currentUser = auth.auth.currentUser;
	const isTableOwner = userId === currentUser.uid;
	const isSpectator = userRole === 'spectator';
	const [issueState, setIssueState] = useState({
		isLoaded: false,
		isLocked: false,
		showVotes: false,
		title: '',
		finalScore: null,
	});
	const [votesState, setVotesState] = useState({
		isLoaded: false,
		mostVotes: -1,
		userVote: null,
		votes: [],
	});
	const issueRef = db.pokerTableIssue(
		userId,
		tableId,
		issue
	);
	const votesRef = db.votesRoot(
		issue
	);

	useEffect(() => {
		return loadIssue();
	}, []);

	useEffect(() => {
		return loadVotes();
	}, []);

	const loadIssue = () => onValue(issueRef, snapshot => {
		if (snapshot.exists()) {
			const issue = snapshot.val();
			const newState = {
				...issueState,
				title: issue.title,
				isLocked: issue.isLocked || false,
				showVotes: issue.showVotes || false,
				finalScore: issue.finalScore !== undefined ? issue.finalScore : null,
				isLoaded: true,
			};
			setIssueState(newState);
		}
	});

	const loadVotes = () => onValue(votesRef, snapshot => {
		if (snapshot.exists()) {
			const newVotesList = [];
			const votes = snapshot.val() || {};
			for (let vote in votes) {
				newVotesList.push({
					...votes[vote],
					userId: vote,
				});
			}
			newVotesList.sort((v1, v2) => {
				if (v1.vote > v2.vote) return 1;
				if (v2.vote > v1.vote) return -1;
				return 0;
			});

			// Get most votes
			const voteTally = newVotesList.reduce((acc, curr) => {
				if (curr.vote in acc) {
					acc[curr.vote]++;
				} else {
					acc[curr.vote] = 1;
				}
				return acc;
			}, {});

			let mostVotes = -1;
			let multipleModes = false;
			for (let points in voteTally) {
				let currentMostVotes = voteTally[mostVotes] || 0;
				if (voteTally[points] === currentMostVotes) {
					multipleModes = true;
				} else if (voteTally[points] >= currentMostVotes) {
					mostVotes = parseInt(points, 10);
					multipleModes = false;
				}
			}
			if (multipleModes) {
				// don't highlight any point values
				mostVotes = -1;
			}

			const myVote =
				newVotesList.find(v => v.userId === currentUser.uid);
			const newState = {
				...votesState,
				userVote: (myVote) ? myVote.vote : null,
				votes: newVotesList.length ? newVotesList : [],
				mostVotes
			};
			// setState(newState);
			setVotesState(newState);
		}
		// Note: No votes is expected for new issues - no need to log
	});

	const handleSelectVote = (userVote) => {
		const previousVote = votesState.userVote;

		// If clicking same vote, clear it
		if (userVote === previousVote) {
			userVote = null;
		}

		// Optimistically update UI
		setVotesState({
			...votesState,
			userVote
		});

		// Update Firebase
		update(child(votesRef, currentUser.uid), {vote: userVote})
			.then(() => {
				if (userVote === null) {
					toast.success('Vote cleared');
				} else {
					toast.success(`Voted: ${userVote}`);
				}
			})
			.catch((error) => {
				// Revert on error
				setVotesState({
					...votesState,
					userVote: previousVote
				});
				toast.error('Failed to submit vote: ' + error.message);
			});
	};

	//suggestion() {
	//let suggestion = '??';
	//let mode = '??';
	//if(issueState.showVotes) {
	//const total = votesState.votes.reduce((t, v) => t + v.vote, 0);
	//const suggestionAvg = (total / votesState.votes.length);
	//suggestion = availablePoints.find( p => p >= suggestionAvg);
	//mode = (votesState.mostVotes > -1) ? votesState.mostVotes : '--';
	//}
	//return(
	//<Header sub>Mode/Mean ({mode}/{suggestion})</Header>
	//);
	//}

	if (!issueState.isLoaded) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="animate-spin" size={48} />
			</div>
		);
	}

	// Get participants with vote status
	const participantsWithVotes = participants.map(participant => {
		const hasVoted = votesState.votes.some(v => v.userId === participant.id);
		const isSpectatorRole = participant.role === 'spectator';
		return {
			...participant,
			hasVoted,
			isSpectatorRole
		};
	});

	return (
		<div className="text-center" id="issue">
			<h1 className="text-4xl font-bold mb-4">{issueState.title}</h1>
			{issueState.finalScore !== null && issueState.finalScore !== undefined && (
				<div className="flex items-center justify-center gap-2 mb-6 text-2xl text-success">
					<Trophy size={28} />
					<span className="font-semibold">Final Score: {issueState.finalScore}</span>
				</div>
			)}

			{/* Participants Vote Status */}
			{participants.length > 0 && (
				<div className="mb-6">
					<div className="flex items-center justify-center gap-4 flex-wrap">
						{participantsWithVotes.map((participant) => {
							const isCurrentUser = participant.id === currentUser.uid;
							return (
								<div
									key={participant.id}
									className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
										isCurrentUser
											? 'bg-primary bg-opacity-10 border border-primary'
											: 'bg-gray-100'
									}`}
								>
									<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
										isCurrentUser
											? 'bg-primary text-white ring-1 ring-primary ring-offset-1'
											: 'bg-gray-400 text-white'
									}`}>
										{participant.displayName.charAt(0).toUpperCase()}
									</div>
									<span className="text-sm font-medium">
										{participant.displayName}
										{isCurrentUser && <span className="text-primary ml-1">(You)</span>}
									</span>
									{participant.isSpectatorRole ? (
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<Eye size={14} />
											<span>Spectator</span>
										</div>
									) : participant.hasVoted ? (
										<CheckCircle size={16} className="text-success" />
									) : (
										<Circle size={16} className="text-gray-400" />
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
				{(isTableOwner) && (
					<Controls
						isLocked={issueState.isLocked}
						issue={issue}
						showVotes={issueState.showVotes}
						votes={votesState.votes}
						finalScore={issueState.finalScore}
					/>
				)}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6" id="voteCards">
					{votesState.votes?.map((v) => {
						const participant = participants.find(p => p.id === v.userId);
						const voterName = participant?.displayName || 'Unknown';
						const isCurrentUserVote = v.userId === currentUser.uid;

						return (
							<div
								key={v.userId}
								className={`
									flex flex-col items-center justify-center p-4 rounded-lg gap-2
									${(votesState.mostVotes === v.vote && issueState.showVotes)
										? 'bg-success text-white border-2 border-success'
										: 'bg-primary text-white border-2 border-primary'}
									${isCurrentUserVote ? 'ring-2 ring-offset-2 ring-primary' : ''}
								`}
							>
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-semibold">
									{voterName.charAt(0).toUpperCase()}
								</div>
								<div className="text-xs font-medium truncate w-full text-center">
									{voterName}
									{isCurrentUserVote && ' (You)'}
								</div>
								<div className="text-3xl font-bold">
									{(issueState.showVotes) ? v.vote : '?'}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			{!issueState.isLocked && !isSpectator && (
				<>
					<VotingBlock
						isLocked={issueState.isLocked}
						onClick={handleSelectVote}
						userVote={votesState.userVote}
					/>
					{onToggleRole && (
						<div className="text-center mt-4">
							<button
								onClick={onToggleRole}
								className="text-sm text-gray-500 hover:text-gray-700 underline"
							>
								Switch to Spectator Mode
							</button>
						</div>
					)}
				</>
			)}
			{isSpectator && !issueState.isLocked && (
				<div className="text-center py-6">
					<p className="text-gray-600 text-sm mb-3">
						You are watching as a spectator.
					</p>
					{onToggleRole && (
						<button
							onClick={onToggleRole}
							className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
						>
							Switch to Voter Mode
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default Issue;
