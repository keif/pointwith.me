import React, {useEffect, useState} from 'react';
import {Trophy, Loader2, CheckCircle, Circle, Eye, Edit2, Check, X} from 'lucide-react';
import toast from 'react-hot-toast';
import {auth, db} from '@/firebase';
import './issue.css';
import {useParams} from 'react-router-dom';
import {child, onValue, update} from 'firebase/database';
import VotingBlock from './VotingBlock';
import Controls from './Controls';
import VotingTimer from './VotingTimer';
import {formatEditHistory} from '@/utils/timeAgo';
import {useInlineEdit} from '@/hooks/useInlineEdit';
import type { ParticipantRole } from '@/types';

interface IssueParticipant {
	id: string;
	displayName: string;
	role: ParticipantRole;
}

interface Vote {
	userId: string;
	vote: number | null;
}

interface VotingScale {
	type: 'fibonacci' | 'tshirt' | 'powers-of-2' | 'linear' | 'custom';
	customValues?: string;
}

interface TimerSettings {
	enabled: boolean;
	duration: number;
	onExpire?: 'justStop' | 'lockVoting' | 'autoReveal';
}

interface IssueProps {
	issue: string | boolean;
	participants?: IssueParticipant[];
	userRole?: ParticipantRole;
	onToggleRole?: () => void;
	onActivity?: () => void;
	votingScale?: VotingScale;
	timerSettings?: TimerSettings;
}

const Issue = ({issue, participants = [], userRole = 'voter', onToggleRole, onActivity, votingScale, timerSettings}: IssueProps) => {
	const {userId, tableId} = useParams<{ userId: string; tableId: string }>();
	const currentUser = auth.auth.currentUser;
	const isTableOwner = currentUser && userId === currentUser.uid;
	const isSpectator = userRole === 'spectator';
	const [issueState, setIssueState] = useState({
		isLoaded: false,
		isLocked: false,
		showVotes: false,
		title: '',
		finalScore: null as number | null,
		lastEdited: null as string | null,
		lastEditedByName: null as string | null,
		timer: {
			isActive: false,
			startedAt: null as string | null,
			remainingSeconds: null as number | null,
		},
	});
	const [votesState, setVotesState] = useState<{
		isLoaded: boolean;
		mostVotes: number;
		userVote: number | null;
		votes: Vote[];
	}>({
		isLoaded: false,
		mostVotes: -1,
		userVote: null,
		votes: [],
	});
	const issueRef = db.pokerTableIssue(
		userId!,
		tableId!,
		issue as string
	);
	const votesRef = db.votesRoot(
		issue as string
	);

	const {
		isEditing: isEditingTitle,
		editedValue: editedTitle,
		setEditedValue: setEditedTitle,
		handleStartEdit: handleStartEditTitle,
		handleCancelEdit: handleCancelEditTitle,
		handleSaveEdit: handleSaveEditTitle,
		handleKeyDown: handleTitleKeyDown
	} = useInlineEdit({
		initialValue: issueState.title,
		onSave: async (trimmedTitle) => {
			if (!currentUser) return;

			const updateData = {
				title: trimmedTitle,
				lastEdited: new Date().toISOString(),
				lastEditedBy: currentUser.uid,
				lastEditedByName: currentUser.displayName || 'Anonymous',
			};

			await toast.promise(
				update(issueRef, updateData),
				{
					loading: 'Updating issue title...',
					success: 'Issue title updated',
					error: 'Failed to update issue title',
				}
			);
			// Update table activity
			onActivity?.();
		},
		maxLength: 200,
		emptyErrorMessage: 'Issue title cannot be empty',
		maxLengthErrorMessage: 'Issue title must be 200 characters or less'
	});

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
				lastEdited: issue.lastEdited || null,
				lastEditedByName: issue.lastEditedByName || null,
				timer: {
					isActive: issue.timer?.isActive || false,
					startedAt: issue.timer?.startedAt || null,
					remainingSeconds: issue.timer?.remainingSeconds || null,
				},
				isLoaded: true,
			};
			setIssueState(newState);
		}
	});

	const loadVotes = () => onValue(votesRef, snapshot => {
		if (snapshot.exists()) {
			const ABSTAIN_VALUE = -1;
			const newVotesList: Vote[] = [];
			const votes = snapshot.val() || {};
			for (let vote in votes) {
				newVotesList.push({
					...votes[vote],
					userId: vote,
				});
			}
			newVotesList.sort((v1, v2) => {
				// Abstentions go to the end
				if (v1.vote === ABSTAIN_VALUE) return 1;
				if (v2.vote === ABSTAIN_VALUE) return -1;
				if (v1.vote === null) return 1;
				if (v2.vote === null) return -1;
				if (v1.vote > v2.vote) return 1;
				if (v2.vote > v1.vote) return -1;
				return 0;
			});

			// Get most votes (excluding abstentions)
			const voteTally = newVotesList.reduce((acc, curr) => {
				if (curr.vote !== null && curr.vote !== ABSTAIN_VALUE) {
					if (curr.vote in acc) {
						acc[curr.vote]++;
					} else {
						acc[curr.vote] = 1;
					}
				}
				return acc;
			}, {} as Record<number, number>);

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

			const myVote = currentUser
				? newVotesList.find(v => v.userId === currentUser.uid)
				: undefined;
			const newState = {
				...votesState,
				userVote: (myVote) ? myVote.vote : null,
				votes: newVotesList.length ? newVotesList : [],
				mostVotes,
				isLoaded: true
			};
			// setState(newState);
			setVotesState(newState);
		}
		// Note: No votes is expected for new issues - no need to log
	});

	const handleSelectVote = (userVote: number | null) => {
		if (!currentUser) return;

		const previousVote = votesState.userVote;
		const ABSTAIN_VALUE = -1;

		// If clicking same vote, clear it
		let newVote: number | null = userVote;
		if (userVote === previousVote) {
			newVote = null;
		}

		// Optimistically update UI
		setVotesState({
			...votesState,
			userVote: newVote
		});

		// Update Firebase
		update(child(votesRef, currentUser.uid), {vote: newVote})
			.then(() => {
				// Don't show toast for host to prevent revealing vote on screen share
				if (!isTableOwner) {
					if (newVote === null) {
						toast.success('Vote cleared');
					} else if (newVote === ABSTAIN_VALUE) {
						toast.success('Abstained from voting');
					} else {
						toast.success(`Voted: ${newVote}`);
					}
				}
				// Update table activity
				onActivity?.();
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

	// Timer control handlers
	const handleTimerToggle = async () => {
		if (!currentUser || !isTableOwner) return;

		const newIsActive = !issueState.timer.isActive;
		const timerData = {
			isActive: newIsActive,
			startedAt: newIsActive ? new Date().toISOString() : issueState.timer.startedAt,
			remainingSeconds: issueState.timer.remainingSeconds ?? timerSettings?.duration ?? 60,
		};

		try {
			await update(issueRef, { timer: timerData });
			// Update table activity
			onActivity?.();
		} catch (error: any) {
			toast.error('Failed to update timer: ' + error.message);
		}
	};

	const handleTimerReset = async () => {
		if (!currentUser || !isTableOwner) return;

		const timerData = {
			isActive: false,
			startedAt: null,
			remainingSeconds: timerSettings?.duration ?? 60,
		};

		try {
			await update(issueRef, { timer: timerData });
			// Update table activity
			onActivity?.();
		} catch (error: any) {
			toast.error('Failed to reset timer: ' + error.message);
		}
	};

	const handleTimerExpire = async () => {
		if (!currentUser || !isTableOwner) return;

		// Play notification sound/show alert
		toast('⏰ Time\'s up!', {
			icon: '⏰',
			duration: 5000,
		});

		// Execute configured expiration behavior
		const expireBehavior = timerSettings?.onExpire || 'justStop';

		try {
			if (expireBehavior === 'autoReveal') {
				// Auto-reveal votes
				await update(issueRef, {
					showVotes: true,
					timer: { ...issueState.timer, isActive: false }
				});
			} else if (expireBehavior === 'lockVoting') {
				// Lock voting
				await update(issueRef, {
					isLocked: true,
					timer: { ...issueState.timer, isActive: false }
				});
			} else {
				// Just stop timer
				await update(issueRef, {
					timer: { ...issueState.timer, isActive: false }
				});
			}
			// Update table activity
			onActivity?.();
		} catch (error: any) {
			toast.error('Failed to handle timer expiration: ' + error.message);
		}
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
			<div className="mb-3 flex items-center justify-center">
				{isEditingTitle && isTableOwner ? (
					<div className="flex items-center gap-2 w-full max-w-2xl">
						<input
							type="text"
							value={editedTitle}
							onChange={(e) => setEditedTitle(e.target.value)}
							onKeyDown={handleTitleKeyDown}
							className="text-2xl font-bold border-2 border-primary rounded px-2 py-1 flex-1 text-center"
							autoFocus
							maxLength={200}
						/>
						<button
							onClick={handleSaveEditTitle}
							className="p-1.5 bg-success text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
							title="Save"
						>
							<Check size={20} />
						</button>
						<button
							onClick={handleCancelEditTitle}
							className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors flex-shrink-0"
							title="Cancel"
						>
							<X size={20} />
						</button>
					</div>
				) : (
					<div className="flex flex-col items-center">
						<div className="flex items-center gap-2 group">
							<h1 className="text-2xl font-bold">{issueState.title}</h1>
							{isTableOwner && (
								<button
									onClick={handleStartEditTitle}
									className="p-1 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
									title="Edit issue title"
								>
									<Edit2 size={18} />
								</button>
							)}
						</div>
						{issueState.lastEdited && issueState.lastEditedByName && (
							<p className="text-xs text-gray-400 italic mt-1">
								{formatEditHistory({
									lastEditedByName: issueState.lastEditedByName,
									lastEdited: issueState.lastEdited
								})}
							</p>
						)}
					</div>
				)}
			</div>
			{issueState.finalScore !== null && issueState.finalScore !== undefined && (
				<div className="flex items-center justify-center gap-2 mb-3 text-xl text-success">
					<Trophy size={22} />
					<span className="font-semibold">Final Score: {issueState.finalScore}</span>
				</div>
			)}

			{/* Voting Timer */}
			{timerSettings?.enabled && (
				<VotingTimer
					duration={timerSettings.duration}
					isActive={issueState.timer.isActive}
					onExpire={handleTimerExpire}
					onToggle={handleTimerToggle}
					onReset={handleTimerReset}
					isHost={isTableOwner || false}
				/>
			)}

			{/* Participants Vote Status */}
			{participants.length > 0 && (
				<div className="mb-3">
					<div className="flex items-center justify-center gap-2 flex-wrap">
						{participantsWithVotes.map((participant) => {
							const isCurrentUser = currentUser && participant.id === currentUser.uid;
							return (
								<div
									key={participant.id}
									onClick={isCurrentUser && onToggleRole ? onToggleRole : undefined}
									className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
										isCurrentUser
											? 'bg-primary bg-opacity-10 border border-primary cursor-pointer hover:bg-primary hover:bg-opacity-20 transition-colors'
											: 'bg-gray-100'
									}`}
									title={isCurrentUser ? 'Click to toggle role' : ''}
								>
									<div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
										isCurrentUser
											? 'bg-primary text-white ring-1 ring-primary ring-offset-1'
											: 'bg-gray-400 text-white'
									}`}>
										{participant.displayName.charAt(0).toUpperCase()}
									</div>
									<span className="font-medium">
										{participant.displayName}
										{isCurrentUser && <span className="text-primary ml-1">(You)</span>}
									</span>
									{participant.isSpectatorRole ? (
										<Eye size={12} className="text-gray-500" />
									) : participant.hasVoted ? (
										<CheckCircle size={14} className="text-success" />
									) : (
										<Circle size={14} className="text-gray-400" />
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-3">
				{(isTableOwner) && (
					<Controls
						isLocked={issueState.isLocked}
						issue={issue}
						showVotes={issueState.showVotes}
						votes={votesState.votes}
						finalScore={issueState.finalScore}
					/>
				)}
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3" id="voteCards">
					{votesState.votes?.map((v) => {
						const participant = participants.find(p => p.id === v.userId);
						const voterName = participant?.displayName || 'Unknown';
						const isCurrentUserVote = currentUser && v.userId === currentUser.uid;
						const ABSTAIN_VALUE = -1;
						const isAbstain = v.vote === ABSTAIN_VALUE;

						return (
							<div
								key={v.userId}
								className={`
									flex flex-col items-center justify-center p-2 rounded-lg gap-1
									${(votesState.mostVotes === v.vote && issueState.showVotes && !isAbstain)
										? 'bg-success text-white border-2 border-success'
										: 'bg-primary text-white border-2 border-primary'}
									${isCurrentUserVote ? 'ring-2 ring-offset-2 ring-primary' : ''}
								`}
							>
								<div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs font-semibold">
									{voterName.charAt(0).toUpperCase()}
								</div>
								<div className="text-xs font-medium truncate w-full text-center">
									{voterName}
									{isCurrentUserVote && ' (You)'}
								</div>
								<div className="text-2xl font-bold">
									{isAbstain ? '☕' : (issueState.showVotes) ? v.vote : '?'}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			{!issueState.isLocked && !isSpectator && (
				<VotingBlock
					isLocked={issueState.isLocked}
					onClick={handleSelectVote}
					userVote={votesState.userVote}
					isHost={isTableOwner}
					votingScale={votingScale}
				/>
			)}
			{isSpectator && !issueState.isLocked && (
				<div className="text-center py-3">
					<p className="text-gray-500 text-sm">
						You are watching as a spectator. Click your name above to switch to voter mode.
					</p>
				</div>
			)}
		</div>
	);
};

export default Issue;
