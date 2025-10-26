/**
 * Standardized Firebase mock patterns for Vitest
 */

import { vi } from 'vitest';

/**
 * Creates a mock Firebase auth object with getter pattern
 */
export const createMockAuth = (currentUser = { uid: 'testUserId', displayName: 'Test User' }) => ({
  get auth() {
    return {
      currentUser,
      onAuthStateChanged: vi.fn(),
      signOut: vi.fn()
    };
  }
});

/**
 * Creates mock Firebase database functions
 */
export const createMockDatabaseFunctions = () => ({
  onValue: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  child: vi.fn(),
  onDisconnect: vi.fn(() => ({
    remove: vi.fn()
  }))
});

/**
 * Creates mock database reference functions
 */
export const createMockDbRefs = () => ({
  pokerTable: vi.fn(),
  pokerTableIssue: vi.fn(),
  pokerTableIssuesRoot: vi.fn(),
  pokerTableParticipants: vi.fn(),
  pokerTableParticipant: vi.fn(),
  votesRoot: vi.fn()
});
