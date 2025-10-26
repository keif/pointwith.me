/**
 * Test utilities for creating mock objects
 */

export const createMockUser = (overrides = {}) => ({
  uid: 'testUserId',
  displayName: 'Test User',
  email: 'test@example.com',
  ...overrides
});

export const createMockFirebaseRef = (path: string) => ({
  path,
  key: path.split('/').pop()
});

export const createMockSnapshot = (data: any, exists = true) => ({
  exists: () => exists,
  val: () => data,
  key: 'mockKey'
});

export const createMockPokerTable = (overrides = {}) => ({
  tableName: 'Test Table',
  ownerName: 'Test Owner',
  created: new Date().toISOString(),
  issues: {},
  ...overrides
});

export const createMockIssue = (overrides = {}) => ({
  title: 'Test Issue',
  created: new Date().toISOString(),
  isLocked: false,
  showVotes: false,
  finalScore: null,
  ...overrides
});
