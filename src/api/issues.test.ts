import * as db from '@/firebase/db';
import { remove as firebaseRemove } from 'firebase/database';
import { createClient } from './issues';

// Mocks
jest.mock('firebase/database', () => ({
    remove: jest.fn(),
}));

jest.mock('@/firebase/db', () => ({
    pokerTableIssue: jest.fn()
}));

describe('Issues API client', () => {
    const userId = 'testUserId';
    const tableId = 'testTableId';
    const issueId = 'testIssueId';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('remove function calls firebaseRemove with correct path', () => {
        // Mock the return value for pokerTableIssue
        const mockPath = { path: 'test/path/to/issue' };
        db.pokerTableIssue.mockReturnValue(mockPath);

        const client = createClient(userId, tableId);
        client.remove(issueId);

        // Ensure the correct path is constructed
        expect(db.pokerTableIssue).toHaveBeenCalledWith(userId, tableId, issueId);

        // Ensure firebaseRemove is called with the path returned from pokerTableIssue
        expect(firebaseRemove).toHaveBeenCalledWith(mockPath);
    });
});
