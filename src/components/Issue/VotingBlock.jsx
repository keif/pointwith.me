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
		<div className="card text-center">
			<div
				className={`grid grid-cols-2 gap-4 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
				data-testid="voteCards"
				id="voteCards"
			>
				{availablePoints.map(p => (
					<button
						key={p}
						onClick={() => handleSelect(p)}
						className={`
							aspect-square flex items-center justify-center text-3xl font-bold rounded-lg
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