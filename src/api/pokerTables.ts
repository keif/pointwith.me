import * as db from '../firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import type { PokerTableClient } from '../types';

/**
 * Creates an api client for managing poker table data.
 *
 * @param userId - user id from firebase
 */
export const createClient = (userId: string): PokerTableClient => {
    /**
     * Deletes a poker table. Returns a promise once the change is committed to firebase.
     *
     * @param pokerTableId - poker table id from firebase
     * @returns a Promise
     */
    const remove = (pokerTableId: string): Promise<void> =>
        firebaseRemove(db.pokerTable(userId, pokerTableId));

    return {
        remove,
    };
};
