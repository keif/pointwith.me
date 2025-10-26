import React, {useState, useEffect} from 'react';
import {Settings as SettingsIcon, Trash2, ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';
import toast from 'react-hot-toast';

import Layout from '../../containers/Layout';
import withAuthentication from '../../containers/withAuthentication';

const Settings = () => {
	const [skipIssueConfirmation, setSkipIssueConfirmation] = useState(false);
	const [skipTableConfirmation, setSkipTableConfirmation] = useState(false);

	// Load settings from localStorage on mount
	useEffect(() => {
		const issueSkip = localStorage.getItem('skipDeleteIssueConfirmation') === 'true';
		const tableSkip = localStorage.getItem('skipDeleteTableConfirmation') === 'true';
		setSkipIssueConfirmation(issueSkip);
		setSkipTableConfirmation(tableSkip);
	}, []);

	const handleToggleIssueConfirmation = (e) => {
		const checked = e.target.checked;
		setSkipIssueConfirmation(checked);

		if (checked) {
			localStorage.setItem('skipDeleteIssueConfirmation', 'true');
			toast.success('Issue delete confirmations disabled');
		} else {
			localStorage.removeItem('skipDeleteIssueConfirmation');
			toast.success('Issue delete confirmations enabled');
		}
	};

	const handleToggleTableConfirmation = (e) => {
		const checked = e.target.checked;
		setSkipTableConfirmation(checked);

		if (checked) {
			localStorage.setItem('skipDeleteTableConfirmation', 'true');
			toast.success('Table delete confirmations disabled');
		} else {
			localStorage.removeItem('skipDeleteTableConfirmation');
			toast.success('Table delete confirmations enabled');
		}
	};

	const handleClearAllSettings = () => {
		localStorage.removeItem('skipDeleteIssueConfirmation');
		localStorage.removeItem('skipDeleteTableConfirmation');
		setSkipIssueConfirmation(false);
		setSkipTableConfirmation(false);
		toast.success('All settings reset to defaults');
	};

	return (
		<Layout>
			<div className="max-w-2xl mx-auto py-8">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<SettingsIcon size={32} className="text-primary" />
					<h1 className="text-3xl font-bold">Settings</h1>
				</div>

				{/* Confirmation Preferences Section */}
				<section className="card mb-6">
					<h2 className="text-xl font-semibold mb-4 pb-3 border-b">
						Delete Confirmations
					</h2>

					<div className="space-y-4">
						{/* Issue Delete Confirmation */}
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								id="skipIssueConfirmation"
								checked={skipIssueConfirmation}
								onChange={handleToggleIssueConfirmation}
								className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
							/>
							<label htmlFor="skipIssueConfirmation" className="flex-1 cursor-pointer">
								<div className="font-medium">Skip issue delete confirmations</div>
								<div className="text-sm text-gray-600 mt-1">
									When enabled, issues will be deleted immediately without asking for confirmation.
								</div>
							</label>
						</div>

						{/* Table Delete Confirmation */}
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								id="skipTableConfirmation"
								checked={skipTableConfirmation}
								onChange={handleToggleTableConfirmation}
								className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
							/>
							<label htmlFor="skipTableConfirmation" className="flex-1 cursor-pointer">
								<div className="font-medium">Skip table delete confirmations</div>
								<div className="text-sm text-gray-600 mt-1">
									When enabled, poker tables will be deleted immediately without asking for confirmation.
									<span className="text-red-600 font-medium"> Warning: This will also delete all issues in the table.</span>
								</div>
							</label>
						</div>
					</div>
				</section>

				{/* Danger Zone Section */}
				<section className="card border-red-200">
					<h2 className="text-xl font-semibold mb-4 pb-3 border-b border-red-200 text-red-700">
						Danger Zone
					</h2>

					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<div className="font-medium text-gray-900">Reset all settings</div>
							<div className="text-sm text-gray-600 mt-1">
								Clear all saved preferences and reset to default values.
							</div>
						</div>
						<button
							onClick={handleClearAllSettings}
							className="btn btn-danger flex items-center gap-2 whitespace-nowrap"
						>
							<Trash2 size={16} />
							Clear All
						</button>
					</div>
				</section>

				{/* Info Section */}
				<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-800">
						<strong>Note:</strong> These settings are stored locally in your browser.
						They will not sync across devices and will be lost if you clear your browser data.
					</p>
				</div>
			</div>
		</Layout>
	);
};

export default withAuthentication(Settings);
