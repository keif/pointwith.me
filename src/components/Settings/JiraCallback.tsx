import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

import { useJiraOAuthCallback } from '@/hooks/useJiraAuth';
import Layout from '@/containers/Layout';
import withAuthentication from '@/containers/withAuthentication';

const JiraCallback: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { isProcessing, error, processCallback } = useJiraOAuthCallback();
	const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

	useEffect(() => {
		const code = searchParams.get('code');
		const state = searchParams.get('state');
		const errorParam = searchParams.get('error');

		if (errorParam) {
			setStatus('error');
			return;
		}

		if (!code || !state) {
			setStatus('error');
			return;
		}

		const handleCallback = async () => {
			const success = await processCallback(code, state);

			if (success) {
				setStatus('success');
				// Redirect to settings after 2 seconds
				setTimeout(() => {
					navigate('/settings');
				}, 2000);
			} else {
				setStatus('error');
			}
		};

		handleCallback();
	}, [searchParams, processCallback, navigate]);

	return (
		<Layout>
			<div className="max-w-2xl mx-auto py-16">
				<div className="card text-center">
					{status === 'processing' && (
						<>
							<div className="flex justify-center mb-4">
								<Loader className="animate-spin text-primary" size={48} />
							</div>
							<h2 className="text-2xl font-bold mb-2">Connecting to Jira</h2>
							<p className="text-gray-600">
								Please wait while we complete the connection...
							</p>
						</>
					)}

					{status === 'success' && (
						<>
							<div className="flex justify-center mb-4">
								<CheckCircle className="text-green-600" size={48} />
							</div>
							<h2 className="text-2xl font-bold mb-2 text-green-700">Successfully Connected!</h2>
							<p className="text-gray-600 mb-4">
								Your Jira account has been connected successfully.
							</p>
							<p className="text-sm text-gray-500">
								Redirecting to settings...
							</p>
						</>
					)}

					{status === 'error' && (
						<>
							<div className="flex justify-center mb-4">
								<XCircle className="text-red-600" size={48} />
							</div>
							<h2 className="text-2xl font-bold mb-2 text-red-700">Connection Failed</h2>
							<p className="text-gray-600 mb-4">
								{error || 'An error occurred while connecting to Jira.'}
							</p>
							<button
								onClick={() => navigate('/settings')}
								className="btn btn-primary"
							>
								Go to Settings
							</button>
						</>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default withAuthentication(JiraCallback);
