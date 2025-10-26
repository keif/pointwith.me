import * as db from '../firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import { createClient } from './pokerTables';

// Mocks
jest.mock('firebase/database', () => ({
  remove: jest.fn(),
}));

jest.mock('../firebase/db', () => ({
  pokerTable: jest.fn()
}));

describe('Poker Tables API client', () => {
  const userId = 'testUserId';
  const pokerTableId = 'testPokerTableId';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('remove function calls firebaseRemove with correct path', () => {
    // Mock the return value for pokerTable
    const mockPath = { path: 'test/path/to/table' };
    db.pokerTable.mockReturnValue(mockPath);

    const client = createClient(userId);
    client.remove(pokerTableId);

    // Ensure the correct path is constructed
    expect(db.pokerTable).toHaveBeenCalledWith(userId, pokerTableId);

    // Ensure firebaseRemove is called with the path returned from pokerTable
    expect(firebaseRemove).toHaveBeenCalledWith(mockPath);
  });
});
