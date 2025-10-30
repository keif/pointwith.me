import React, {useState} from 'react';
import {HelpCircle} from 'lucide-react';
import {getScaleValues, getDefaultScale, voteToNumber} from '@/utils/votingScales';
import type {VotingScale} from '@/utils/votingScales';

interface VotingBlockProps {
	onClick: (vote: number | null) => void;
	isLocked: boolean;
	userVote: number | null;
	votingScale?: {
		type: 'fibonacci' | 'tshirt' | 'powers-of-2' | 'linear' | 'custom';
		customValues?: string;
	};
}

const ABSTAIN_VALUE = -1;

const VotingBlock = ({onClick, isLocked, userVote, votingScale}: VotingBlockProps) => {
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

	return (
		<div className="text-center">
			<div
				className={`grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-lg mx-auto ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
				data-testid="voteCards"
				id="voteCards"
			>
				{availableValues.map(value => {
					const numericValue = typeof value === 'string' ? voteToNumber(value) : value;
					const isSelected = selectedValue === numericValue || userVote === numericValue;

					return (
						<button
							key={value}
							onClick={() => handleSelect(value)}
							className={`
								aspect-square flex items-center justify-center text-lg font-bold rounded-lg
								transition-all cursor-pointer
								${isSelected
									? 'bg-success text-white border-2 border-success scale-105'
									: 'bg-primary text-white border-2 border-primary hover:scale-105'}
							`}
						>
							{value}
						</button>
					);
				})}
				{/* Abstain Button */}
				<button
					onClick={() => handleSelect(ABSTAIN_VALUE)}
					className={`
						aspect-square flex items-center justify-center text-lg font-bold rounded-lg
						transition-all cursor-pointer
						${selectedValue === ABSTAIN_VALUE || userVote === ABSTAIN_VALUE
							? 'bg-gray-500 text-white border-2 border-gray-600 scale-105'
							: 'bg-gray-400 text-white border-2 border-gray-500 hover:scale-105'}
					`}
					title="Abstain / Pass"
				>
					<HelpCircle size={24} />
				</button>
			</div>
		</div>
	);
}

export default VotingBlock;