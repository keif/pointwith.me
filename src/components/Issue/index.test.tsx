import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Issue from './index';

// Mock the firebase functions
vi.mock('firebase/database', () => ({
	onValue: vi.fn(),
	update: vi.fn(),
	child: vi.fn()
}));

// Mock useParams hook
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useParams: vi.fn()
	};
});

// Mock firebase
vi.mock('@/firebase', () => ({
	auth: {
		get auth() {
			return {
				currentUser: {uid: 'testUserId', displayName: 'Test User'}
			};
		}
	},
	db: {
		pokerTableIssue: vi.fn((userId: any, tableId: any, issue: any) => ({
			path: `pokerTableIssue/${userId}/${tableId}/${issue}`
		})),
		votesRoot: vi.fn((issue: any) => ({
			path: `votesRoot/${issue}`
		}))
	}
}));

describe('Issue Component', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		// Mock useParams values
		const { useParams } = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});
	});

	test('renders Issue component and displays loading message', () => {
		// Render the component
		const {getByText} = render(<Issue issue="testIssue"/>);

		// Check if the loading message is displayed
		expect(getByText('Loading')).toBeInTheDocument();
	});

	test('renders Issue component with Controls when isTableOwner is true', async () => {
		const { onValue } = await import('firebase/database');

		// Mock onValue function for issueRef
		vi.mocked(onValue).mockImplementationOnce((ref: any, callback: any) => {
			const snapshot = {
				exists: vi.fn(() => true),
				val: vi.fn(() => ({title: 'Test Issue', isLocked: false, showVotes: false}))
			};
			callback(snapshot);
			return vi.fn(); // Return unsubscribe
		});

		// Render the component
		const {getByText} = render(<Issue issue="testIssue"/>);

		// Wait for data to be loaded
		await waitFor(() => {
			expect(getByText('Test Issue')).toBeInTheDocument();
		});

		// Check if Controls component is rendered when isTableOwner is true
		expect(getByText('Show Votes')).toBeInTheDocument();
	});

	test('renders VotingBlock component when issueState.isLocked is false', async () => {
		const { onValue } = await import('firebase/database');

		// Mock onValue function for issueRef
		vi.mocked(onValue).mockImplementationOnce((ref: any, callback: any) => {
			const snapshot = {
				exists: vi.fn(() => true),
				val: vi.fn(() => ({title: 'Test Issue', isLocked: false, showVotes: false}))
			};
			callback(snapshot);
			return vi.fn(); // Return unsubscribe
		});

		// Render the component
		const {getByTestId} = render(<Issue issue="testIssue"/>);

		// Wait for data to be loaded
		await waitFor(() => {
			expect(getByTestId('voteCards')).toBeInTheDocument();
		});

		// Check if VotingBlock component is rendered when issueState.isLocked is false
		expect(getByTestId('voteCards')).toBeInTheDocument();
	});

	// Add more tests based on your specific requirements
});
