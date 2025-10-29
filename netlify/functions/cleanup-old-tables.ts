import type { Config } from '@netlify/functions';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin SDK
// NOTE: This requires FIREBASE_SERVICE_ACCOUNT environment variable
// containing the Firebase service account JSON
const initializeFirebase = () => {
	if (getApps().length === 0) {
		const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!serviceAccount) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
		}

		initializeApp({
			credential: cert(JSON.parse(serviceAccount)),
			databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
		});
	}
	return getDatabase();
};

// Delete a table and all its associated data
const deleteTable = async (db: ReturnType<typeof getDatabase>, userId: string, tableId: string) => {
	const tableRef = db.ref(`pokerTables/${userId}/${tableId}`);
	await tableRef.remove();
	console.log(`Deleted table: ${userId}/${tableId}`);
};

// Main cleanup logic
const cleanupOldTables = async () => {
	const db = initializeFirebase();
	const RETENTION_DAYS = 90; // Tables older than 90 days will be deleted
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
	const cutoffISO = cutoffDate.toISOString();

	console.log(`Starting cleanup: deleting tables with lastActivity before ${cutoffISO}`);

	// Get all tables
	const pokerTablesRef = db.ref('pokerTables');
	const snapshot = await pokerTablesRef.once('value');

	if (!snapshot.exists()) {
		console.log('No tables found');
		return { deleted: 0 };
	}

	const allTables = snapshot.val();
	let deletedCount = 0;
	const deletionPromises: Promise<void>[] = [];

	// Iterate through all user's tables
	for (const userId in allTables) {
		const userTables = allTables[userId];
		for (const tableId in userTables) {
			const table = userTables[tableId];
			const lastActivity = table.lastActivity || table.created;

			// Check if table is older than retention period
			if (lastActivity && lastActivity < cutoffISO) {
				console.log(`Marking for deletion: ${userId}/${tableId} (lastActivity: ${lastActivity})`);
				deletionPromises.push(deleteTable(db, userId, tableId));
				deletedCount++;
			}
		}
	}

	// Execute all deletions
	await Promise.all(deletionPromises);
	console.log(`Cleanup complete: deleted ${deletedCount} tables`);

	return { deleted: deletedCount, cutoffDate: cutoffISO };
};

// Netlify function handler
export default async () => {
	try {
		const result = await cleanupOldTables();
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Cleanup completed successfully',
				...result,
			}),
		};
	} catch (error) {
		console.error('Error during cleanup:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Cleanup failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			}),
		};
	}
};

// Schedule: Run daily at 2:00 AM UTC
// NOTE: Scheduled Functions require Netlify Pro plan or higher
// Alternatively, you can trigger this manually via POST request
export const config: Config = {
	schedule: '@daily',
};
