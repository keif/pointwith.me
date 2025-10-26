import { User as FirebaseUser } from 'firebase/auth';
import { DatabaseReference } from 'firebase/database';

// Firebase types
export type User = FirebaseUser;

// Vote types
export interface Vote {
  vote: number | null;
  userId?: string;
  userName?: string;
  timestamp?: number;
}

// Issue types
export interface Issue {
  id: string;
  name: string;
  description?: string;
  finalScore?: number | null;
  revealed?: boolean;
  createdAt?: number;
  updatedAt?: number;
  editHistory?: EditHistoryEntry[];
}

export interface EditHistoryEntry {
  timestamp: number;
  userId: string;
  userName: string;
  field: 'name' | 'description' | 'finalScore';
  oldValue: string | number | null;
  newValue: string | number | null;
}

// Participant types
export type ParticipantRole = 'voter' | 'spectator';

export interface Participant {
  id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  role: ParticipantRole;
  joinedAt?: number;
}

// Poker Table types
export interface PokerTable {
  id: string;
  tableName: string;
  ownerId: string;
  ownerName: string;
  createdAt: number;
  updatedAt?: number;
  issues?: Record<string, Issue>;
  participants?: Record<string, Participant>;
  editHistory?: EditHistoryEntry[];
}

// API Client types
export interface IssueClient {
  remove: (issueId: string) => Promise<void>;
}

export interface PokerTableClient {
  remove: (tableId: string) => Promise<void>;
}

// Settings types
export interface UserSettings {
  skipDeleteIssueConfirmation?: boolean;
  skipDeleteTableConfirmation?: boolean;
}

// Firebase database reference helpers
export type DbRef = DatabaseReference;
