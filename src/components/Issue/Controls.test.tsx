import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Controls from './Controls';

// Mock the firebase functions
vi.mock('firebase/database', () => ({
    update: vi.fn()
}));

vi.mock('@/firebase', () => ({
    db: {
        pokerTableIssue: vi.fn()
    }
}));

// Mock useParams hook
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn()
    };
});

describe('Controls component', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Mock useParams values
        const { useParams } = await import('react-router-dom');
        vi.mocked(useParams).mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});
    });

    test('rendered correctly', () => {
        // Render the component
        const {getByText} = render(
            <Controls isLocked={false} issue="testIssue" showVotes={false}/>
        );

        // Check if the buttons and their initial state are rendered correctly
        expect(getByText('Show Votes')).toBeInTheDocument();
        expect(getByText('Lock Voting')).toBeInTheDocument();
    });

    describe('handles button clicks', () => {
        test('to show votes', async () => {
            const { db } = await import('@/firebase');
            const { update } = await import('firebase/database');

            // Mock the return value for pokerTableIssue
            const mockRef = {path: 'test/path'};
            vi.mocked(db.pokerTableIssue).mockReturnValue(mockRef as any);

            // Render the component
            const {getByText} = render(
                <Controls isLocked={false} issue="testIssue" showVotes={false} votes={[]} finalScore={null}/>
            );

            // Simulate a click event on the "Show Votes" button
            fireEvent.click(getByText('Show Votes'));

            // Check if the update function is called with the correct arguments
            expect(update).toHaveBeenCalledWith(mockRef, {showVotes: true});
        });

        test('to lock voting', async () => {
            const { db } = await import('@/firebase');
            const { update } = await import('firebase/database');

            // Mock the return value for pokerTableIssue
            const mockRef = {path: 'test/path'};
            vi.mocked(db.pokerTableIssue).mockReturnValue(mockRef as any);

            // Render the component
            const {getByText} = render(
                <Controls isLocked={false} issue="testIssue" showVotes={false} votes={[]} finalScore={null}/>
            );

            // Simulate a click event on the "Lock Voting" button
            fireEvent.click(getByText('Lock Voting'));

            // Check if the update function is called with the correct arguments
            expect(update).toHaveBeenCalledWith(mockRef, {isLocked: true});
        });
    });
});

// Add more test cases as needed
