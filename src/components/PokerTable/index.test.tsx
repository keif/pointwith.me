import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import {PokerTable} from './index';

// Mocks
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn(() => ({})),
	ref: vi.fn((db, path) => ({ path })),
	get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
	onValue: vi.fn(),
	set: vi.fn(() => Promise.resolve()),
	update: vi.fn(() => Promise.resolve()),
	remove: vi.fn(() => Promise.resolve()),
	onDisconnect: vi.fn(() => ({
		remove: vi.fn(() => Promise.resolve())
	})),
	child: vi.fn()
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useParams: vi.fn()
	};
});

vi.mock('@/firebase', () => ({
	auth: {
		get auth() {
			return {
				currentUser: {uid: 'testUserId', displayName: 'Test User'}
			};
		}
	},
	db: {
		pokerTable: vi.fn(),
		pokerTableIssuesRoot: vi.fn(),
		pokerTableParticipants: vi.fn(),
		pokerTableParticipant: vi.fn()
	}
}));

vi.mock('@/api/issues', () => ({
	createClient: vi.fn(() => ({
		remove: vi.fn()
	}))
}));

vi.mock('@/containers/Layout', () => ({
	default: ({children}: any) => <div data-testid="layout">{children}</div>
}));

vi.mock('../Issue', () => ({
	default: () => <div data-testid="issue-component"></div>
}));

vi.mock('./IssueCreator', () => ({
	default: () => <div data-testid="issue-creator-component"></div>
}));

vi.mock('./ModalActions', () => ({
	default: () => <div data-testid="modal-actions-component"></div>
}));

vi.mock('./RoleSelectionModal', () => ({
	default: () => <div data-testid="role-selection-modal"></div>
}));

describe('PokerTable Component', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { useParams } = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});
	});

	test('as a voter, cannot remove issues', () => {
		const {queryByTestId} = render(
			<BrowserRouter>
				<PokerTable/>
			</BrowserRouter>
		);

		// Expect the delete button not to be present
		expect(queryByTestId('delete-issue-button')).not.toBeInTheDocument();
	});

	test.skip('as an owner, can delete an issue', async () => {
		const { db } = await import('@/firebase');
		const { onValue } = await import('firebase/database');
		const issues = await import('@/api/issues');

		const remove = vi.fn();
		// Mock firebase database responses
		vi.mocked(db.pokerTable).mockReturnValue({ path: 'pokerTables/testUserId' } as any);
		vi.mocked(db.pokerTableIssuesRoot).mockReturnValue({ path: 'pokerTables/testUserId/testTableId/issues' } as any);
		vi.mocked(db.pokerTableParticipants).mockReturnValue({ path: 'participants' } as any);
		vi.mocked(issues.createClient).mockReturnValue({ remove } as any);

		// Mock onValue to return different data based on which ref is called
		vi.mocked(onValue).mockImplementation((ref: any, callback: any) => {
			// Return table data for pokerTable ref
			if (ref.path?.includes('pokerTables/testUserId') && !ref.path?.includes('issues') && !ref.path?.includes('participants')) {
				callback({
					exists: () => true,
					val: () => ({
						tableName: 'Test Table',
						created: new Date().toISOString()
					})
				});
			}
			// Return issues data for issues ref
			else if (ref.path?.includes('issues')) {
				callback({
					exists: () => true,
					val: () => ({
						'testIssue': {
							created: new Date().toISOString(),
							score: 0,
							title: "test issue"
						}
					})
				});
			}
			// Return participants data
			else {
				callback({
					exists: () => false,
					val: () => null
				});
			}
			return vi.fn(); // Return unsubscribe
		});

		// Render the component
		const {getByTestId} = render(
			<BrowserRouter>
				<PokerTable/>
			</BrowserRouter>
		);

		// Fire event to simulate deleting an issue
		fireEvent.click(getByTestId('delete-issue-button'));

		// Wait for the expected outcome
		await waitFor(() => {
			expect(remove).toHaveBeenCalled();
		});
	});

	// Additional tests as needed...
});
