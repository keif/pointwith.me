import React, {useState} from 'react';
import {Scale, Check, X} from 'lucide-react';
import {update} from 'firebase/database';
import toast from 'react-hot-toast';
import {DEFAULT_SCALES, type VotingScaleType} from '@/utils/votingScales';

interface VotingScaleSelectorProps {
	currentScale?: {
		type: VotingScaleType;
		customValues?: string;
	};
	tableRef: any; // Firebase reference
}

const VotingScaleSelector: React.FC<VotingScaleSelectorProps> = ({currentScale, tableRef}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [selectedType, setSelectedType] = useState<VotingScaleType>(currentScale?.type || 'fibonacci');
	const [customValues, setCustomValues] = useState(currentScale?.customValues || '');

	const handleSave = async () => {
		const scaleData = {
			type: selectedType,
			customValues: selectedType === 'custom' ? customValues : '',
		};

		try {
			await update(tableRef, {votingScale: scaleData});
			toast.success('Voting scale updated!');
			setIsEditing(false);
		} catch (error: any) {
			toast.error('Failed to update voting scale: ' + error.message);
		}
	};

	const handleCancel = () => {
		setSelectedType(currentScale?.type || 'fibonacci');
		setCustomValues(currentScale?.customValues || '');
		setIsEditing(false);
	};

	const currentLabel = DEFAULT_SCALES[currentScale?.type || 'fibonacci']?.label || 'Fibonacci';

	if (!isEditing) {
		return (
			<div className="flex items-center gap-2">
				<Scale size={18} className="text-primary" />
				<span className="text-sm text-gray-600">Scale: {currentLabel}</span>
				<button
					onClick={() => setIsEditing(true)}
					className="text-xs text-primary hover:underline"
				>
					Change
				</button>
			</div>
		);
	}

	return (
		<div className="border border-primary rounded-lg p-4 bg-blue-50">
			<div className="flex items-center gap-2 mb-3">
				<Scale size={18} className="text-primary" />
				<h3 className="text-sm font-semibold text-primary">Change Voting Scale</h3>
			</div>

			<div className="space-y-3">
				{/* Scale Type Selection */}
				<div className="space-y-2">
					{(Object.keys(DEFAULT_SCALES) as VotingScaleType[]).map((scaleType) => (
						<label key={scaleType} className="flex items-start gap-2 cursor-pointer">
							<input
								type="radio"
								name="votingScale"
								value={scaleType}
								checked={selectedType === scaleType}
								onChange={(e) => setSelectedType(e.target.value as VotingScaleType)}
								className="mt-1"
							/>
							<div className="flex-1">
								<div className="text-sm font-medium">{DEFAULT_SCALES[scaleType].label}</div>
							</div>
						</label>
					))}
				</div>

				{/* Custom Values Input */}
				{selectedType === 'custom' && (
					<div>
						<label className="block text-xs text-gray-600 mb-1">
							Enter comma-separated values (e.g., "1, 2, 3, 5, 8"):
						</label>
						<input
							type="text"
							value={customValues}
							onChange={(e) => setCustomValues(e.target.value)}
							placeholder="1, 2, 3, 5, 8, 13"
							className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
						/>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2 pt-2">
					<button
						onClick={handleSave}
						className="btn btn-primary btn-sm flex items-center gap-1"
					>
						<Check size={14} />
						Save
					</button>
					<button
						onClick={handleCancel}
						className="btn btn-secondary btn-sm flex items-center gap-1"
					>
						<X size={14} />
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default VotingScaleSelector;
