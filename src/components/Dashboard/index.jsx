// Theirs
import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {format} from 'date-fns';
import {X} from 'lucide-react';
import {onValue, set} from 'firebase/database';
import shortid from 'shortid';

// Ours
import {auth, db} from '../../firebase';
import * as pokerTablesApi from '../../api/pokerTables';
import Layout from '../../containers/Layout';
import withAuthentication from '../../containers/withAuthentication';
import PokerTableNameForm from './PokerTableNameForm';


const Dashboard = () => {
	const currentUser = auth.auth.currentUser;
	const pokerTablesClient = pokerTablesApi.createClient(currentUser.uid);
	const [pokerTables, setPokerTables] = useState([]);

	useEffect(() => {
		loadPokerTables();
	}, []);

	const createPokerTable = (newPokerTableName) => {
		const uid = shortid.generate();
		const pRef = db.pokerTable(currentUser.uid, uid);
		const data = {
			created: new Date().toISOString(),
			tableName: newPokerTableName,
		};
		set(pRef, data)
			.then(() => console.log('Updated successfully'))
			.catch((error) => console.log('Error updating document: ', error));
		loadPokerTables();
	};

	const removePokerTable = (pokerTableId) => (e) => {
		e.preventDefault();

		// Optimistically deletes poker table. i.e. doesn't block the ui from updating
		pokerTablesClient.remove(pokerTableId);

		const filteredPokerTables = pokerTables.filter(
			({id}) => id !== pokerTableId
		);

		setPokerTables(filteredPokerTables);
	};

	const loadPokerTables = () => {
		const pokerTablesRef = db.pokerTables(currentUser.uid);
		onValue(pokerTablesRef, (snapshot) => {
			if (snapshot.exists()) {
				const pokerTables = snapshot.val();
				let newPokerTablesState = [];
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
				</div>

				{/* Tables List */}
				<div className="card">
					<h1 className="text-3xl font-bold mb-6">Your Poker Tables</h1>
					<div className="divide-y divide-gray-200">
						{pokerTables.length > 0 ? pokerTables.map((s) => (
							<div key={s.id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors">
								<Link
									to={`/table/${currentUser.uid}/${s.id}`}
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
		</Layout>
	);
};

export default withAuthentication(Dashboard);

// Export Dashboard without the withAuthentication HOC for testing
export {Dashboard};