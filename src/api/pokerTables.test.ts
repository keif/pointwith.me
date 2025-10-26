import { vi } from 'vitest';
import * as db from '@/firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import { createClient } from './pokerTables';

// Mocks
vi.mock('firebase/database', () => ({
  remove: vi.fn(),
}));

vi.mock('@/firebase/db', () => ({
  pokerTable: vi.fn()
}));

describe('Poker Tables API client', () => {
  const userId = 'testUserId';
  const pokerTableId = 'testPokerTableId';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('remove function calls firebaseRemove with correct path', () => {
    // Mock the return value for pokerTable
    const mockPath = { path: 'test/path/to/table' };
    vi.mocked(db.pokerTable).mockReturnValue(mockPath as any);

    const client = createClient(userId);
    client.remove(pokerTableId);

    // Ensure the correct path is constructed
    expect(db.pokerTable).toHaveBeenCalledWith(userId, pokerTableId);

    // Ensure firebaseRemove is called with the path returned from pokerTable
    expect(firebaseRemove).toHaveBeenCalledWith(mockPath);
  });
});
