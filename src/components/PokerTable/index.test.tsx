import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import {PokerTable} from './index';

// Mocks
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn(() => ({})),
	onValue: vi.fn(),
	set: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
	onDisconnect: vi.fn(() => ({
		remove: vi.fn()
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

	test('as an owner, can delete an issue', async () => {
		const remove = jest.fn();
		// Mock firebase database responses
		mockPokerTable.mockReturnValue({ path: 'pokerTables/testUserId' });
		mockPokerTableIssuesRoot.mockReturnValue({ path: 'pokerTables/testUserId/testTableId/issues' });
		issues.createClient.mockReturnValue({ remove });
		onValue.mockImplementation((ref, callback) => {
			const snapshot = {
				exists: jest.fn(() => true),
				val: jest.fn(() => ({
					tableName: 'Test Table',
					created: 'Fri Nov 17 2023 22:31:08 GMT-0500 (Eastern Standard Time)',
					issues: {
						'testIssue': {
							created: "2023-12-14T19:40:46.578Z",
							score: 0,
							title: "test issue"
						}
					}
				}))
			};
			callback(snapshot);
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
