import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom';
import Controls from './Controls'; // Assuming the component file is named Controls.js
import * as firebaseDatabase from 'firebase/database';
import {useParams} from 'react-router-dom';

// Mock the firebase functions
jest.mock('firebase/database');

const mockPokerTableIssue = jest.fn();
jest.mock('@/firebase', () => ({
    db: {
        get pokerTableIssue() {
            return mockPokerTableIssue;
        }
    }
}));

// Mock useParams hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

describe('Controls component', () => {
    beforeEach(() => {
        // Mock useParams values
        useParams.mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});
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
        test('to show votes', () => {
            // Mock the return value for pokerTableIssue
            const mockRef = {path: 'test/path'};
            mockPokerTableIssue.mockReturnValue(mockRef);

            // Render the component
            const {getByText} = render(
                <Controls isLocked={false} issue="testIssue" showVotes={false}/>
            );

            // Simulate a click event on the "Show Votes" button
            fireEvent.click(getByText('Show Votes'));

            // Check if the update function is called with the correct arguments
            expect(firebaseDatabase.update).toHaveBeenCalledWith(mockRef, {showVotes: true});
        });

        test('to lock voting', () => {
            // Mock the return value for pokerTableIssue
            const mockRef = {path: 'test/path'};
            mockPokerTableIssue.mockReturnValue(mockRef);

            // Render the component
            const {getByText} = render(
                <Controls isLocked={false} issue="testIssue" showVotes={false}/>
            );

            // Simulate a click event on the "Lock Voting" button
            fireEvent.click(getByText('Lock Voting'));

            // Check if the update function is called with the correct arguments
            expect(firebaseDatabase.update).toHaveBeenCalledWith(mockRef, {isLocked: true});
        });
    });
});

// Add more test cases as needed
