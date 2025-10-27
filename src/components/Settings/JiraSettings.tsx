import React, { useState, useEffect } from 'react';
import { Link2, Unlink, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

import { useJiraAuth } from '@/hooks/useJiraAuth';
import { getCustomFields } from '@/services/jira';
import type { JiraCustomField } from '@/types/jira';

const JiraSettings: React.FC = () => {
	const { isConnected, isLoading, config, error, connect, disconnect, updateConfig } = useJiraAuth();
	const [customFields, setCustomFields] = useState<JiraCustomField[]>([]);
	const [loadingFields, setLoadingFields] = useState(false);
	const [selectedFieldId, setSelectedFieldId] = useState<string>('');
	const [savingField, setSavingField] = useState(false);

	// Load custom fields when connected
	useEffect(() => {
		if (isConnected && config) {
			loadCustomFields();
			setSelectedFieldId(config.storyPointsFieldId || '');
		}
	}, [isConnected, config?.cloudId]);

	const loadCustomFields = async () => {
		if (!config) return;

		try {
			setLoadingFields(true);
			const fields = await getCustomFields(config.cloudId, config.accessToken);
			setCustomFields(fields);
		} catch (err) {
			console.error('Error loading custom fields:', err);
			toast.error('Failed to load custom fields');
		} finally {
			setLoadingFields(false);
		}
	};

	const handleConnect = () => {
		try {
			connect();
		} catch (err) {
			toast.error('Failed to start Jira connection');
		}
	};

	const handleDisconnect = async () => {
		try {
			await disconnect();
			toast.success('Jira disconnected successfully');
			setCustomFields([]);
			setSelectedFieldId('');
		} catch (err) {
			toast.error('Failed to disconnect Jira');
		}
	};

	const handleSaveField = async () => {
		if (!config || !selectedFieldId) return;

		try {
			setSavingField(true);
			await updateConfig({ storyPointsFieldId: selectedFieldId });
			toast.success('Story points field saved');
		} catch (err) {
			toast.error('Failed to save field configuration');
		} finally {
			setSavingField(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader className="animate-spin text-primary" size={24} />
			</div>
		);
	}

	return (
		<section className="card mb-6">
			<div className="flex items-center justify-between mb-4 pb-3 border-b">
				<h2 className="text-xl font-semibold">Jira Integration</h2>
				{isConnected && (
					<div className="flex items-center gap-2 text-sm text-green-600">
						<CheckCircle size={16} />
						<span>Connected</span>
					</div>
				)}
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
					<AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
					<div className="text-sm text-red-800">{error}</div>
				</div>
			)}

			{!isConnected ? (
				<>
					<p className="text-gray-600 mb-4">
						Connect your Jira account to import issues and sync story point estimates.
					</p>

					<div className="space-y-3 mb-4">
						<div className="text-sm text-gray-700">
							<strong>Features:</strong>
						</div>
						<ul className="text-sm text-gray-600 space-y-2 ml-4">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span>Import issues from Jira using JQL queries</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span>Push story point estimates back to Jira</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span>Batch sync multiple issues at once</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span>Track sync status for each issue</span>
							</li>
						</ul>
					</div>

					<button
						onClick={handleConnect}
						className="btn btn-primary flex items-center gap-2"
					>
						<Link2 size={16} />
						Connect to Jira
					</button>

					<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">
							<strong>Note:</strong> You'll be redirected to Atlassian to authorize access.
							Make sure you have admin permissions to the Jira site you want to connect.
						</p>
					</div>
				</>
			) : (
				<>
					{/* Connection Info */}
					<div className="mb-6 space-y-3">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<div className="text-sm text-gray-600 mb-1">Connected Site</div>
								<div className="flex items-center gap-2">
									<span className="font-medium">{config?.site}</span>
									<a
										href={`https://${config?.site}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:text-primary-dark"
									>
										<ExternalLink size={14} />
									</a>
								</div>
							</div>
							<button
								onClick={handleDisconnect}
								className="btn btn-secondary flex items-center gap-2"
							>
								<Unlink size={16} />
								Disconnect
							</button>
						</div>

						{config?.connectedAt && (
							<div className="text-sm text-gray-600">
								Connected on {new Date(config.connectedAt).toLocaleDateString()}
							</div>
						)}
					</div>

					{/* Story Points Field Configuration */}
					<div className="border-t pt-4">
						<h3 className="font-semibold mb-3">Story Points Field</h3>
						<p className="text-sm text-gray-600 mb-3">
							Select the custom field used for story points in your Jira instance.
						</p>

						{loadingFields ? (
							<div className="flex items-center gap-2 text-gray-600">
								<Loader className="animate-spin" size={16} />
								<span className="text-sm">Loading fields...</span>
							</div>
						) : customFields.length > 0 ? (
							<div className="space-y-3">
								<select
									value={selectedFieldId}
									onChange={(e) => setSelectedFieldId(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
								>
									<option value="">Select a field...</option>
									{customFields.map((field) => (
										<option key={field.id} value={field.id}>
											{field.name} ({field.id})
										</option>
									))}
								</select>

								<button
									onClick={handleSaveField}
									disabled={!selectedFieldId || savingField || selectedFieldId === config?.storyPointsFieldId}
									className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{savingField ? (
										<>
											<Loader className="animate-spin" size={16} />
											Saving...
										</>
									) : (
										'Save Field'
									)}
								</button>

								{config?.storyPointsFieldId && (
									<div className="text-sm text-green-600 flex items-center gap-2">
										<CheckCircle size={14} />
										Currently using: {customFields.find(f => f.id === config.storyPointsFieldId)?.name || config.storyPointsFieldId}
									</div>
								)}
							</div>
						) : (
							<div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
								No custom fields found. Make sure your Jira instance has a story points field configured.
							</div>
						)}
					</div>

					{/* Help Link */}
					<div className="mt-4 pt-4 border-t">
						<a
							href="/docs/JIRA_INTEGRATION.md"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
						>
							<span>View setup guide and documentation</span>
							<ExternalLink size={12} />
						</a>
					</div>
				</>
			)}
		</section>
	);
};

export default JiraSettings;
