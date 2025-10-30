import React, {useState, useEffect} from 'react';
import {Timer, Play, Pause, RotateCcw} from 'lucide-react';

interface VotingTimerProps {
	duration: number; // Duration in seconds
	isActive: boolean;
	onExpire: () => void;
	onToggle: () => void;
	onReset: () => void;
	isHost: boolean;
}

const VotingTimer: React.FC<VotingTimerProps> = ({
	duration,
	isActive,
	onExpire,
	onToggle,
	onReset,
	isHost
}) => {
	const [timeLeft, setTimeLeft] = useState(duration);

	useEffect(() => {
		setTimeLeft(duration);
	}, [duration]);

	useEffect(() => {
		if (!isActive || timeLeft <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					onExpire();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, timeLeft, onExpire]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const progress = ((duration - timeLeft) / duration) * 100;
	const isWarning = timeLeft <= 10 && timeLeft > 0;
	const isExpired = timeLeft === 0;

	return (
		<div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<Timer size={20} className={`
						${isExpired ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-primary'}
					`} />
					<span className="font-semibold text-lg">
						Voting Timer
					</span>
				</div>
				<div className={`
					text-3xl font-bold tabular-nums
					${isExpired ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-primary'}
				`}>
					{formatTime(timeLeft)}
				</div>
			</div>

			{/* Progress Bar */}
			<div className="w-full bg-gray-200 rounded-full h-2 mb-3">
				<div
					className={`h-2 rounded-full transition-all duration-1000 ${
						isExpired ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-primary'
					}`}
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Host Controls */}
			{isHost && (
				<div className="flex gap-2">
					<button
						onClick={onToggle}
						className={`btn btn-sm flex items-center gap-2 ${
							isActive ? 'btn-secondary' : 'btn-primary'
						}`}
					>
						{isActive ? (
							<>
								<Pause size={14} />
								Pause
							</>
						) : (
							<>
								<Play size={14} />
								Start
							</>
						)}
					</button>
					<button
						onClick={onReset}
						className="btn btn-secondary btn-sm flex items-center gap-2"
						disabled={!isActive && timeLeft === duration}
					>
						<RotateCcw size={14} />
						Reset
					</button>
				</div>
			)}

			{!isHost && (
				<p className="text-xs text-gray-500 text-center">
					{isExpired
						? 'Time is up!'
						: isActive
							? 'Voting in progress...'
							: 'Timer paused'}
				</p>
			)}
		</div>
	);
};

export default VotingTimer;
