import {Eye, EyeOff, Lock, Unlock, CheckCircle, Check, Save} from 'lucide-react';
import React, {useState} from 'react';
import {update} from 'firebase/database';
import toast from 'react-hot-toast';
import {db} from '@/firebase';
import {useParams} from 'react-router-dom';
import {calculateAverage, calculateMode, calculateSuggestedScore} from '@/utils/voteCalculations';

const Controls = ({isLocked, issue, showVotes, votes, finalScore}) => {
	const {userId, tableId} = useParams();
	const [customScore, setCustomScore] = useState('');

	const issueRef = db.pokerTableIssue(
		userId,
		tableId,
		issue
	);

	const handleShow = () => {
		const newState = !showVotes;
		update(issueRef, {'showVotes': newState})
			.then(() => {
				toast.success(newState ? 'Votes revealed!' : 'Votes hidden');
			})
			.catch((error) => {
				toast.error('Failed to toggle votes: ' + error.message);
			});
	};

	const handleLock = () => {
		const newState = !isLocked;
		update(issueRef, {'isLocked': newState})
			.then(() => {
				toast.success(newState ? 'Voting locked' : 'Voting unlocked');
			})
			.catch((error) => {
				toast.error('Failed to toggle lock: ' + error.message);
			});
	};

	const handleSetFinalScore = (score) => {
		toast.promise(
			update(issueRef, {'finalScore': score}),
			{
				loading: 'Setting final score...',
				success: `Final score set to ${score}!`,
				error: 'Failed to set final score',
			}
		).then(() => {
			setCustomScore('');
		});
	};

	const handleClearFinalScore = () => {
		toast.promise(
			update(issueRef, {'finalScore': null}),
			{
				loading: 'Clearing final score...',
				success: 'Final score cleared',
				error: 'Failed to clear final score',
			}
		);
	};

	const average = calculateAverage(votes);
	const suggestedScore = calculateSuggestedScore(votes);
	const mode = calculateMode(votes);

	return (
		<div id="voteControls" className="text-center space-y-4">
			{/* Toggle Buttons */}
			<div className="flex gap-2 justify-center">
				<button
					onClick={handleShow}
					className={`btn flex items-center gap-2 ${showVotes ? 'btn-success' : 'btn-secondary'}`}
				>
					{showVotes ? <EyeOff size={18} /> : <Eye size={18} />}
					{`${showVotes ? 'Hide' : 'Show'}`} Votes
				</button>
				<button
					onClick={handleLock}
					className={`btn flex items-center gap-2 ${isLocked ? 'btn-danger' : 'btn-secondary'}`}
				>
					{isLocked ? <Unlock size={18} /> : <Lock size={18} />}
					{`${isLocked ? 'Unlock' : 'Lock'}`} Voting
				</button>
			</div>

			{votes && votes.length > 0 && showVotes && (
				<>
					{/* Divider */}
					<div className="border-t border-gray-300 my-4"></div>

					{/* Statistics */}
					<div className="flex gap-3 justify-center mb-4">
						<div className="bg-gray-100 px-4 py-2 rounded">
							<div className="text-xs text-gray-600">Average</div>
							<div className="text-lg font-bold">{average.toFixed(2)}</div>
						</div>
						<div className="bg-blue-100 px-4 py-2 rounded">
							<div className="text-xs text-blue-600">Suggested (Prime)</div>
							<div className="text-lg font-bold text-blue-700">{suggestedScore}</div>
						</div>
						{mode !== null && (
							<div className="bg-green-100 px-4 py-2 rounded">
								<div className="text-xs text-green-600">Mode</div>
								<div className="text-lg font-bold text-green-700">{mode}</div>
							</div>
						)}
					</div>

					{/* Final Score Section */}
					<div className="text-center">
						{finalScore !== null && finalScore !== undefined ? (
							<>
								<div className="flex items-center justify-center gap-2 text-xl text-success mb-3">
									<CheckCircle size={24} />
									<span className="font-semibold">Final Score: {finalScore}</span>
								</div>
								<button
									onClick={handleClearFinalScore}
									className="btn btn-danger text-sm"
								>
									Clear Final Score
								</button>
							</>
						) : (
							<>
								<h4 className="text-lg font-semibold mb-3">Set Final Score</h4>
								<div className="mb-3">
									<button
										onClick={() => handleSetFinalScore(suggestedScore)}
										className="btn btn-success flex items-center gap-2 mx-auto"
									>
										<Check size={18} />
										Use Suggested ({suggestedScore})
									</button>
								</div>
								<div className="flex gap-2 justify-center">
									<input
										type="number"
										placeholder="Enter custom score..."
										value={customScore}
										onChange={(e) => setCustomScore(e.target.value)}
										className="input max-w-xs"
									/>
									<button
										disabled={!customScore || customScore === ''}
										onClick={() => handleSetFinalScore(parseFloat(customScore))}
										className="btn btn-primary flex items-center gap-2"
									>
										<Save size={18} />
										Set Custom Score
									</button>
								</div>
							</>
						)}
					</div>
				</>
			)}

			{/* Divider */}
			<div className="border-t border-gray-300 my-4"></div>
		</div>
	);
};

export default Controls;