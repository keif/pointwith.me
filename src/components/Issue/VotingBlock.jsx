import React, {useState} from 'react';
import fibonacci from '../../utils/fibonacci';

const availablePoints = [...new Set(fibonacci(8))];
const VotingBlock = ({onClick, isLocked, userVote}) => {
	const [selectedValue, setSelectedValue] = useState(null);

	const handleSelect = (p) => {
		setSelectedValue(p);
		onClick(p);
	}

	return (
		<div className="text-center">
			<div
				className={`grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-lg mx-auto ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
				data-testid="voteCards"
				id="voteCards"
			>
				{availablePoints.map(p => (
					<button
						key={p}
						onClick={() => handleSelect(p)}
						className={`
							aspect-square flex items-center justify-center text-lg font-bold rounded-lg
							transition-all cursor-pointer
							${selectedValue === p || userVote === p
								? 'bg-success text-white border-2 border-success scale-105'
								: 'bg-primary text-white border-2 border-primary hover:scale-105'}
						`}
					>
						{p}
					</button>
				))}
			</div>
		</div>
	);
}

export default VotingBlock;