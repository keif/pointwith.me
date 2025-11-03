import React, {useState} from 'react';
import {Timer, Check, X} from 'lucide-react';
import {update} from 'firebase/database';
import toast from 'react-hot-toast';

interface TimerSettingsProps {
	currentSettings?: {
		enabled: boolean;
		duration: number; // in seconds
		onExpire?: 'justStop' | 'lockVoting' | 'autoReveal';
	};
	tableRef: any; // Firebase reference
}

const PRESET_DURATIONS = [
	{ label: '30 seconds', value: 30 },
	{ label: '1 minute', value: 60 },
	{ label: '2 minutes', value: 120 },
	{ label: '3 minutes', value: 180 },
	{ label: '5 minutes', value: 300 },
];

const TimerSettings: React.FC<TimerSettingsProps> = ({currentSettings, tableRef}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [enabled, setEnabled] = useState(currentSettings?.enabled || false);
	const [duration, setDuration] = useState(currentSettings?.duration || 60);
	const [onExpire, setOnExpire] = useState<'justStop' | 'lockVoting' | 'autoReveal'>(
		currentSettings?.onExpire || 'justStop'
	);

	const handleSave = async () => {
		const timerData = {
			enabled,
			duration,
			onExpire,
		};

		try {
			await update(tableRef, {timerSettings: timerData});
			toast.success('Timer settings updated!');
			setIsEditing(false);
		} catch (error: any) {
			toast.error('Failed to update timer settings: ' + error.message);
		}
	};

	const handleCancel = () => {
		setEnabled(currentSettings?.enabled || false);
		setDuration(currentSettings?.duration || 60);
		setOnExpire(currentSettings?.onExpire || 'justStop');
		setIsEditing(false);
	};

	const formatDuration = (seconds: number) => {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
	};

	if (!isEditing) {
		return (
			<div className="flex items-center gap-2">
				<Timer size={18} className="text-primary" />
				<span className="text-sm text-gray-600">
					Timer: {currentSettings?.enabled ? `Enabled (${formatDuration(currentSettings.duration)})` : 'Disabled'}
				</span>
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
				<Timer size={18} className="text-primary" />
				<h3 className="text-sm font-semibold text-primary">Timer Settings</h3>
			</div>

			<div className="space-y-3">
				{/* Enable/Disable Toggle */}
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={enabled}
						onChange={(e) => setEnabled(e.target.checked)}
						className="w-4 h-4"
					/>
					<span className="text-sm font-medium">Enable voting timer</span>
				</label>

				{/* Duration Selection */}
				{enabled && (
					<div>
						<label className="block text-xs text-gray-600 mb-2">
							Duration:
						</label>
						<div className="grid grid-cols-2 gap-2">
							{PRESET_DURATIONS.map((preset) => (
								<button
									key={preset.value}
									onClick={() => setDuration(preset.value)}
									className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
										duration === preset.value
											? 'bg-primary text-white'
											: 'bg-white border border-gray-300 hover:border-primary'
									}`}
								>
									{preset.label}
								</button>
							))}
						</div>
						<div className="mt-2">
							<label className="block text-xs text-gray-600 mb-1">
								Custom (seconds):
							</label>
							<input
								type="number"
								min="10"
								max="600"
								value={duration}
								onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
								className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
							/>
						</div>
					</div>
				)}

				{/* Expiration Behavior */}
				{enabled && (
					<div>
						<label className="block text-xs text-gray-600 mb-2">
							When timer expires:
						</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="onExpire"
									value="justStop"
									checked={onExpire === 'justStop'}
									onChange={(e) => setOnExpire(e.target.value as any)}
									className="w-4 h-4"
								/>
								<span className="text-sm">Just stop timer (host still controls reveal/lock)</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="onExpire"
									value="lockVoting"
									checked={onExpire === 'lockVoting'}
									onChange={(e) => setOnExpire(e.target.value as any)}
									className="w-4 h-4"
								/>
								<span className="text-sm">Lock voting (prevent new/changed votes)</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="onExpire"
									value="autoReveal"
									checked={onExpire === 'autoReveal'}
									onChange={(e) => setOnExpire(e.target.value as any)}
									className="w-4 h-4"
								/>
								<span className="text-sm">Auto-reveal all votes</span>
							</label>
						</div>
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

export default TimerSettings;
