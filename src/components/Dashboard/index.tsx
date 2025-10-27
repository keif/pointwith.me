// Theirs
import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {format} from 'date-fns';
import {X, Download} from 'lucide-react';
import {onValue, set} from 'firebase/database';
import shortid from 'shortid';
import toast from 'react-hot-toast';

// Ours
import {auth, db} from '@/firebase';
import * as pokerTablesApi from '@/api/pokerTables';
import Layout from '@/containers/Layout';
import withAuthentication from '@/containers/withAuthentication';
import PokerTableNameForm from './PokerTableNameForm';
import ConfirmDialog from '../common/ConfirmDialog';
import JiraImportModal from './JiraImportModal';
import { useJiraAuth } from '@/hooks/useJiraAuth';
import type { JiraIssue } from '@/types/jira';

interface PokerTableData {
	id: string;
	tableName: string;
	created: string;
	ownerId: string;
	ownerName: string;
}

const Dashboard = () => {
	const navigate = useNavigate();
	const currentUser = auth.auth.currentUser;
	const pokerTablesClient = currentUser ? pokerTablesApi.createClient(currentUser.uid) : null;
	const { isConnected } = useJiraAuth();
	const [pokerTables, setPokerTables] = useState<PokerTableData[]>([]);
	const [isJiraImportOpen, setIsJiraImportOpen] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState<{
		isOpen: boolean;
		tableId: string | null;
		tableName: string;
	}>({
		isOpen: false,
		tableId: null,
		tableName: '',
	});

	useEffect(() => {
		loadPokerTables();
	}, []);

	const createPokerTable = (newPokerTableName: string) => {
		if (!currentUser) return;

		const uid = shortid.generate();
		const pRef = db.pokerTable(currentUser.uid, uid);
		const data = {
			created: new Date().toISOString(),
			tableName: newPokerTableName,
			ownerId: currentUser.uid,
			ownerName: currentUser.displayName || 'Anonymous',
		};
		set(pRef, data)
			.then(() => console.log('Updated successfully'))
			.catch((error) => console.log('Error updating document: ', error));
		loadPokerTables();
	};

	const removePokerTable = (pokerTableId: string) => (e: React.MouseEvent) => {
		e.preventDefault();

		const table = pokerTables.find(t => t.id === pokerTableId);
		const tableName = table?.tableName || 'Table';

		// Check if user has disabled confirmation
		const skipConfirmation = localStorage.getItem('skipDeleteTableConfirmation') === 'true';

		if (skipConfirmation) {
			performDeleteTable(pokerTableId);
		} else {
			setDeleteConfirmation({
				isOpen: true,
				tableId: pokerTableId,
				tableName,
			});
		}
	};

	const performDeleteTable = (pokerTableId: string | null) => {
		if (!pokerTableId || !pokerTablesClient) return;

		// Optimistically deletes poker table. i.e. doesn't block the ui from updating
		pokerTablesClient.remove(pokerTableId);

		const filteredPokerTables = pokerTables.filter(
			({id}) => id !== pokerTableId
		);

		setPokerTables(filteredPokerTables);
	};

	const handleConfirmDeleteTable = () => {
		const {tableId} = deleteConfirmation;
		performDeleteTable(tableId);
		setDeleteConfirmation({ isOpen: false, tableId: null, tableName: '' });
	};

	const handleCancelDeleteTable = () => {
		setDeleteConfirmation({ isOpen: false, tableId: null, tableName: '' });
	};

	const handleImportFromJira = (issues: JiraIssue[]) => {
		if (!currentUser || issues.length === 0) return;

		// Create a new table with the first issue's project name or generic name
		const tableName = issues[0].projectName
			? `${issues[0].projectName} Issues`
			: 'Jira Import';

		const tableId = shortid.generate();
		const tableRef = db.pokerTable(currentUser.uid, tableId);

		// Prepare table data
		const tableData = {
			created: new Date().toISOString(),
			tableName,
			ownerId: currentUser.uid,
			ownerName: currentUser.displayName || 'Anonymous',
		};

		// Prepare issues data
		const issuesData: Record<string, any> = {};
		issues.forEach((jiraIssue) => {
			const issueId = shortid.generate();
			issuesData[issueId] = {
				title: `${jiraIssue.key}: ${jiraIssue.summary}`,
				created: new Date().toISOString(),
				isLocked: false,
				showVotes: false,
				finalScore: jiraIssue.storyPoints || null,
				jiraKey: jiraIssue.key,
				jiraId: jiraIssue.id,
				jiraUrl: jiraIssue.jiraUrl,
			};
		});

		// Create table with issues
		set(tableRef, {
			...tableData,
			issues: issuesData,
		})
			.then(() => {
				toast.success(`Created table with ${issues.length} ${issues.length === 1 ? 'issue' : 'issues'}`);
				// Navigate to the new table
				navigate(`/table/${currentUser.uid}/${tableId}`);
			})
			.catch((error) => {
				console.error('Error creating table:', error);
				toast.error('Failed to create table');
			});
	};

	const loadPokerTables = () => {
		if (!currentUser) return;

		const pokerTablesRef = db.pokerTables(currentUser.uid);
		onValue(pokerTablesRef, (snapshot) => {
			if (snapshot.exists()) {
				const pokerTables = snapshot.val();
				let newPokerTablesState: PokerTableData[] = [];
				for (let table in pokerTables) {
					newPokerTablesState.push({
						...pokerTables[table],
						id: table,
					});
				}
				newPokerTablesState.sort((t1, t2) => {
					if (t1.created > t2.created) return -1;
					if (t2.created > t1.created) return 1;
					return 0;
				});
				setPokerTables(newPokerTablesState);
			}
		});
	};

	return (
		<Layout data-testid={`Dashboard`}>
			<div className="space-y-6">
				{/* Create Table Form */}
				<div className="card">
					<PokerTableNameForm handlePokerTableSubmit={createPokerTable}/>

					{/* Import from Jira Button */}
					{isConnected && (
						<div className="mt-4 pt-4 border-t border-gray-200">
							<button
								onClick={() => setIsJiraImportOpen(true)}
								className="btn btn-secondary flex items-center gap-2"
							>
								<Download size={16} />
								Import from Jira
							</button>
						</div>
					)}
				</div>

				{/* Tables List */}
				<div className="card">
					<h1 className="text-3xl font-bold mb-6">Your Poker Tables</h1>
					<div className="divide-y divide-gray-200">
						{pokerTables.length > 0 ? pokerTables.map((s) => (
							<div key={s.id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors">
								<Link
									to={`/table/${currentUser?.uid}/${s.id}`}
									className="flex-1 no-underline text-inherit hover:text-primary transition-colors"
								>
									<h3 className="text-lg font-semibold text-gray-900">{s.tableName}</h3>
									<p className="text-sm text-gray-500">Table ID: {s.id}</p>
									{s.created && (
										<p className="text-sm text-gray-500">
											Created: {(() => {
												try {
													const date = new Date(s.created);
													return isNaN(date.getTime()) ? 'Unknown' : format(date, 'MM/dd/yyyy hh:mm a');
												} catch (e) {
													return 'Unknown';
												}
											})()}
										</p>
									)}
								</Link>
								<button
									data-testid="delete-button"
									onClick={removePokerTable(s.id)}
									className="ml-4 p-2 text-danger hover:bg-red-50 rounded transition-colors"
									aria-label="Delete table"
								>
									<X size={20} />
								</button>
							</div>
						)) : (
							<p className="text-gray-500 text-center py-8">No poker tables found. Create one above!</p>
						)}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteConfirmation.isOpen}
				title="Delete Poker Table"
				message={`Are you sure you want to delete "${deleteConfirmation.tableName}"? This will permanently delete the table and all its issues. This action cannot be undone.`}
				confirmText="Delete Table"
				cancelText="Cancel"
				onConfirm={handleConfirmDeleteTable}
				onCancel={handleCancelDeleteTable}
				showDontAskAgain={true}
				dontAskAgainKey="skipDeleteTableConfirmation"
			/>

			{/* Jira Import Modal */}
			<JiraImportModal
				isOpen={isJiraImportOpen}
				onClose={() => setIsJiraImportOpen(false)}
				onImport={handleImportFromJira}
			/>
		</Layout>
	);
};

export default withAuthentication(Dashboard);

// Export Dashboard without the withAuthentication HOC for testing
export {Dashboard};