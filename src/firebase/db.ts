import { getDatabase, orderByKey, query, ref, DatabaseReference, Query } from 'firebase/database';
import app from './firebase';

export const db = getDatabase(app);

// Tables
export const pokerTablesRoot = (userId: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}`);

export const pokerTables = (userId: string): Query =>
    query(ref(db, `pokerTables/${userId}`), orderByKey());

export const pokerTable = (userId: string, uid: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}/${uid}`);

// Votes
export const votesRoot = (tid: string): DatabaseReference =>
    ref(db, `votes/${tid}`);

// Issues
export const pokerTableIssuesRoot = (userId: string, tid: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}/${tid}/issues`);

export const pokerTableIssue = (userId: string, tid: string, iid: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}/${tid}/issues/${iid}`);

// Participants
export const pokerTableParticipants = (userId: string, tid: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}/${tid}/participants`);

export const pokerTableParticipant = (userId: string, tid: string, participantId: string): DatabaseReference =>
    ref(db, `pokerTables/${userId}/${tid}/participants/${participantId}`);
