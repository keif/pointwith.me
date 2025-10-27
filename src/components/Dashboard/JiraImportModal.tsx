import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

import { useJiraAuth } from '@/hooks/useJiraAuth';
import { fetchJiraIssues } from '@/services/jira';
import { JQL_PRESETS, type JiraIssue } from '@/types/jira';

interface JiraImportModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (issues: JiraIssue[]) => void;
}

const JiraImportModal: React.FC<JiraImportModalProps> = ({ isOpen, onClose, onImport }) => {
	const { config, isConnected, getValidConfig } = useJiraAuth();
	const [selectedPreset, setSelectedPreset] = useState<string>('');
	const [customJQL, setCustomJQL] = useState<string>('');
	const [useCustomJQL, setUseCustomJQL] = useState(false);
	const [issues, setIssues] = useState<JiraIssue[]>([]);
	const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchComplete, setFetchComplete] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			// Reset state when modal closes
			setSelectedPreset('');
			setCustomJQL('');
			setUseCustomJQL(false);
			setIssues([]);
			setSelectedIssues(new Set());
			setLoading(false);
			setError(null);
			setFetchComplete(false);
		}
	}, [isOpen]);

	const handleFetchIssues = async () => {
		const jql = useCustomJQL ? customJQL : selectedPreset;

		if (!jql) {
			setError('Please select a preset or enter a custom JQL query');
			return;
		}

		setLoading(true);
		setError(null);
		setFetchComplete(false);

		try {
			// Get a valid config with fresh token if needed
			const validConfig = await getValidConfig();

			if (!validConfig) {
				toast.error('Jira not connected');
				throw new Error('Jira connection lost');
			}

			const fetchedIssues = await fetchJiraIssues(
				validConfig.cloudId,
				validConfig.accessToken,
				jql,
				50
			);

			setIssues(fetchedIssues);

			// Select all by default
			const allIssueIds = new Set(fetchedIssues.map(issue => issue.id));
			setSelectedIssues(allIssueIds);

			setFetchComplete(true);

			if (fetchedIssues.length === 0) {
				toast('No issues found matching your query', { icon: 'ℹ️' });
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const toggleIssueSelection = (issueId: string) => {
		const newSelection = new Set(selectedIssues);
		if (newSelection.has(issueId)) {
			newSelection.delete(issueId);
		} else {
			newSelection.add(issueId);
		}
		setSelectedIssues(newSelection);
	};

	const toggleSelectAll = () => {
		if (selectedIssues.size === issues.length) {
			setSelectedIssues(new Set());
		} else {
			setSelectedIssues(new Set(issues.map(issue => issue.id)));
		}
	};

	const handleImport = () => {
		const issuesToImport = issues.filter(issue => selectedIssues.has(issue.id));

		if (issuesToImport.length === 0) {
			toast.error('Please select at least one issue to import');
			return;
		}

		onImport(issuesToImport);
		onClose();
	};

	if (!isOpen) return null;

	if (!isConnected) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold">Import from Jira</h2>
						<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
							<X size={24} />
						</button>
					</div>
					<div className="text-center py-8">
						<AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
						<p className="text-gray-700 mb-4">Jira is not connected</p>
						<p className="text-sm text-gray-600 mb-4">
							Connect your Jira account in Settings to import issues.
						</p>
						<button onClick={onClose} className="btn btn-primary">
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold">Import Issues from Jira</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						<X size={24} />
					</button>
				</div>

				{/* JQL Query Selection */}
				<div className="mb-6">
					<h3 className="font-semibold mb-3">Select Issues</h3>

					{/* Toggle between preset and custom */}
					<div className="flex gap-4 mb-4">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								checked={!useCustomJQL}
								onChange={() => setUseCustomJQL(false)}
								className="w-4 h-4 text-primary"
							/>
							<span>Use Preset Query</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								checked={useCustomJQL}
								onChange={() => setUseCustomJQL(true)}
								className="w-4 h-4 text-primary"
							/>
							<span>Custom JQL</span>
						</label>
					</div>

					{!useCustomJQL ? (
						<select
							value={selectedPreset}
							onChange={(e) => setSelectedPreset(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
						>
							<option value="">Select a preset...</option>
							{JQL_PRESETS.map((preset) => (
								<option key={preset.label} value={preset.jql}>
									{preset.label} - {preset.description}
								</option>
							))}
						</select>
					) : (
						<div>
							<textarea
								value={customJQL}
								onChange={(e) => setCustomJQL(e.target.value)}
								placeholder="Enter JQL query (e.g., project = MYPROJ AND status = 'To Do')"
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
								rows={3}
							/>
							<p className="text-sm text-gray-600 mt-1">
								Need help? Check out{' '}
								<a
									href="https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline inline-flex items-center gap-1"
								>
									JQL documentation
									<ExternalLink size={12} />
								</a>
							</p>
						</div>
					)}

					<button
						onClick={handleFetchIssues}
						disabled={loading || (!selectedPreset && !customJQL)}
						className="btn btn-primary mt-3 disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader className="animate-spin" size={16} />
								Fetching Issues...
							</>
						) : (
							'Fetch Issues'
						)}
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
						<AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-red-800">{error}</div>
					</div>
				)}

				{/* Issues List */}
				{fetchComplete && issues.length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-semibold">
								Issues ({issues.length} found, {selectedIssues.size} selected)
							</h3>
							<button
								onClick={toggleSelectAll}
								className="text-sm text-primary hover:underline"
							>
								{selectedIssues.size === issues.length ? 'Deselect All' : 'Select All'}
							</button>
						</div>

						<div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
							{issues.map((issue) => (
								<div
									key={issue.id}
									className={`p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
										selectedIssues.has(issue.id) ? 'bg-blue-50' : ''
									}`}
									onClick={() => toggleIssueSelection(issue.id)}
								>
									<div className="flex items-start gap-3">
										<input
											type="checkbox"
											checked={selectedIssues.has(issue.id)}
											onChange={() => toggleIssueSelection(issue.id)}
											className="mt-1 w-4 h-4 text-primary"
											onClick={(e) => e.stopPropagation()}
										/>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="font-mono text-sm text-primary font-semibold">
													{issue.key}
												</span>
												{issue.status && (
													<span className="text-xs px-2 py-1 bg-gray-200 rounded">
														{issue.status}
													</span>
												)}
												{issue.priority && (
													<span className="text-xs text-gray-600">
														{issue.priority}
													</span>
												)}
											</div>
											<div className="text-sm font-medium text-gray-900 mb-1">
												{issue.summary}
											</div>
											<div className="flex items-center gap-3 text-xs text-gray-600">
												{issue.issueType && <span>{issue.issueType}</span>}
												{issue.assignee && <span>Assignee: {issue.assignee}</span>}
												{issue.storyPoints && <span>{issue.storyPoints} points</span>}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="flex items-center justify-end gap-3 mt-4">
							<button onClick={onClose} className="btn btn-secondary">
								Cancel
							</button>
							<button
								onClick={handleImport}
								disabled={selectedIssues.size === 0}
								className="btn btn-primary disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
							>
								<CheckCircle size={16} />
								Import {selectedIssues.size} {selectedIssues.size === 1 ? 'Issue' : 'Issues'}
							</button>
						</div>
					</div>
				)}

				{/* Empty State */}
				{fetchComplete && issues.length === 0 && !error && (
					<div className="text-center py-8 text-gray-600">
						<p>No issues found matching your query.</p>
						<p className="text-sm mt-2">Try adjusting your search criteria.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default JiraImportModal;
