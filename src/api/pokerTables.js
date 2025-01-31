import * as db from '../firebase/db';
import {remove as firebaseRemove} from 'firebase/database';

/**
 * Creates an api client for managing poker table data.
 *
 * @param {*} userId - user id from firebase
 */
export const createClient = (userId) => {
  /**
   * Deletes a poker table. Returns a promise once the change is committed to firebase.
   *
   * @param {*} pokerTableId
   * @return a Promise
   */
  const remove = (pokerTableId) => firebaseRemove(db.pokerTable(userId, pokerTableId));

  return {
    remove,
  };
};
