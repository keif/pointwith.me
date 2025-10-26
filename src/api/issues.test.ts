import { vi } from 'vitest';
import * as db from '@/firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import { createClient } from './issues';

// Mocks
vi.mock('firebase/database', () => ({
    remove: vi.fn(),
}));

vi.mock('@/firebase/db', () => ({
    pokerTableIssue: vi.fn()
}));

describe('Issues API client', () => {
    const userId = 'testUserId';
    const tableId = 'testTableId';
    const issueId = 'testIssueId';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('remove function calls firebaseRemove with correct path', () => {
        // Mock the return value for pokerTableIssue
        const mockPath = { path: 'test/path/to/issue' };
        vi.mocked(db.pokerTableIssue).mockReturnValue(mockPath as any);

        const client = createClient(userId, tableId);
        client.remove(issueId);

        // Ensure the correct path is constructed
        expect(db.pokerTableIssue).toHaveBeenCalledWith(userId, tableId, issueId);

        // Ensure firebaseRemove is called with the path returned from pokerTableIssue
        expect(firebaseRemove).toHaveBeenCalledWith(mockPath);
    });
});
