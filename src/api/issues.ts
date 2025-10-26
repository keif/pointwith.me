import * as db from '../firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import type { IssueClient } from '../types';

/**
 * Creates an api client for managing issue data within a specific poker table.
 *
 * @param userId - user id from firebase
 * @param tableId - parent poker table id from firebase
 */
export const createClient = (userId: string, tableId: string): IssueClient => {
    /**
     * Deletes an issue from a poker table. Returns a promise once the change is committed to firebase.
     *
     * @param issueId - issue id from firebase
     * @returns a Promise
     */
    const remove = (issueId: string): Promise<void> =>
        firebaseRemove(db.pokerTableIssue(userId, tableId, issueId));

    return {
        remove,
    };
};
