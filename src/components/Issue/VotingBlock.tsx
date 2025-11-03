import React, {useState, useEffect} from 'react';
import {Coffee} from 'lucide-react';
import {getScaleValues, getDefaultScale, voteToNumber} from '@/utils/votingScales';
import type {VotingScale} from '@/utils/votingScales';

interface VotingBlockProps {
	onClick: (vote: number | null) => void;
	isLocked: boolean;
	userVote: number | null;
	isHost?: boolean;
	votingScale?: {
		type: 'fibonacci' | 'tshirt' | 'powers-of-2' | 'linear' | 'custom';
		customValues?: string;
	};
}

const ABSTAIN_VALUE = -1;

const VotingBlock = ({onClick, isLocked, userVote, isHost = false, votingScale}: VotingBlockProps) => {
	const [selectedValue, setSelectedValue] = useState<number | null>(null);

	// Get scale values, default to Fibonacci if not specified
	const scale: VotingScale = votingScale
		? {
			type: votingScale.type,
			label: '',
			values: [],
			customValues: votingScale.customValues,
		}
		: getDefaultScale();

	const availableValues = getScaleValues(scale);

	const handleSelect = (value: string | number) => {
		// Convert to number for storage (t-shirt sizes get mapped to numbers)
		const numericValue = typeof value === 'string' ? voteToNumber(value) : value;
		setSelectedValue(numericValue);
		onClick(numericValue);
	}

	// Keyboard shortcuts for all users
	useEffect(() => {
		if (isLocked) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input/textarea
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Map number keys to vote card indices
			// 1 = first card (index 0), 2 = second card (index 1), etc.
			// 0 = abstain
			const key = e.key;

			if (key === '0') {
				handleSelect(ABSTAIN_VALUE);
				e.preventDefault();
				return;
			}

			const keyNum = parseInt(key, 10);
			if (keyNum >= 1 && keyNum <= 9) {
				const index = keyNum - 1;
				if (index < availableValues.length) {
					handleSelect(availableValues[index]);
					e.preventDefault();
				}
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [isLocked, availableValues]);

	return (
		<div className="text-center">
			{/* Keyboard hints */}
			{!isLocked && (
				<div className="mb-2 text-sm text-gray-600 italic">
					{isHost
						? `Tip: Press number keys 1-${Math.min(9, availableValues.length)} to vote (your vote will be hidden from view), 0 to abstain`
						: `Tip: Press number keys 1-${Math.min(9, availableValues.length)} to vote, 0 to abstain`
					}
				</div>
			)}
			<div
				className={`grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-lg mx-auto ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
				data-testid="voteCards"
				id="voteCards"
			>
				{availableValues.map((value, index) => {
					const numericValue = typeof value === 'string' ? voteToNumber(value) : value;
					// Hide selection visual feedback for host to prevent showing on screen share
					const isSelected = !isHost && (selectedValue === numericValue || userVote === numericValue);
					const keyHint = index + 1; // 1-based indexing for keys

					return (
						<button
							key={value}
							onClick={() => handleSelect(value)}
							className={`
								aspect-square flex items-center justify-center text-lg font-bold rounded-lg
								transition-all cursor-pointer relative
								${isSelected
									? 'bg-success text-white border-2 border-success scale-105'
									: 'bg-primary text-white border-2 border-primary hover:scale-105'}
							`}
						>
							{value}
							{/* Keyboard hint badge */}
							{!isLocked && keyHint <= 9 && (
								<span className="absolute top-0.5 right-0.5 bg-black bg-opacity-60 text-white text-[10px] font-semibold rounded px-1 leading-tight">
									{keyHint}
								</span>
							)}
						</button>
					);
				})}
				{/* Abstain Button */}
				<button
					onClick={() => handleSelect(ABSTAIN_VALUE)}
					className={`
						aspect-square flex items-center justify-center text-lg font-bold rounded-lg
						transition-all cursor-pointer relative
						${!isHost && (selectedValue === ABSTAIN_VALUE || userVote === ABSTAIN_VALUE)
							? 'bg-success text-white border-2 border-success scale-105'
							: 'bg-primary text-white border-2 border-primary hover:scale-105'}
					`}
					title="Abstain / Pass"
				>
					<Coffee size={24} />
					{/* Keyboard hint badge */}
					{!isLocked && (
						<span className="absolute top-0.5 right-0.5 bg-black bg-opacity-60 text-white text-[10px] font-semibold rounded px-1 leading-tight">
							0
						</span>
					)}
				</button>
			</div>
		</div>
	);
}

export default VotingBlock;