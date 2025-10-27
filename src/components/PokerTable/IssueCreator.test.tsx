import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import IssueCreator from './IssueCreator';
import {mockedNavigator} from '../../setupTests';

const mockNavigate = vi.fn();

// Mocks
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useParams: vi.fn(),
		useNavigate: () => mockNavigate
	};
});

vi.mock('@/firebase', () => ({
	auth: {
		get auth() {
			return {
				currentUser: {
					uid: 'testUserId',
					displayName: 'Test User'
				}
			};
		}
	},
	db: {
		pokerTable: vi.fn()
	}
}));

vi.mock('./IssueNameForm', () => ({
	default: ({handleIssueSubmit}: any) => (
		<div data-testid="issue-name-form" onClick={handleIssueSubmit}>
			IssueNameForm
		</div>
	)
}));

vi.mock('firebase/database', () => ({
	set: vi.fn(),
	update: vi.fn()
}));

// Default props for tests
const defaultProps = {
	onClick: vi.fn(),
	tableName: 'Test Table',
	ownerName: 'Test Owner',
	created: new Date().toISOString(),
	lastEdited: undefined,
	lastEditedByName: undefined
};

describe('IssueCreator Component', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		mockNavigate.mockClear();
	});

	test('renders correctly for a non-owner user', async () => {
		const {useParams} = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({userId: 'differentUserId', tableId: 'testTableId'});

		const {getByText, queryByTestId} = render(<IssueCreator {...defaultProps} />);

		expect(getByText('Test Table')).toBeInTheDocument();
		expect(getByText('Return to Lobby')).toBeInTheDocument();
		expect(queryByTestId('issue-name-form')).not.toBeInTheDocument();
	});

	test('renders correctly for the owner user', async () => {
		const {useParams} = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});

		const {getByText, getByTestId} = render(<IssueCreator {...defaultProps} />);

		expect(getByText('Test Table')).toBeInTheDocument();
		expect(getByText('Return to Lobby')).toBeInTheDocument();
		expect(getByTestId('issue-name-form')).toBeInTheDocument();
	});

	test('navigates to the dashboard on click', async () => {
		const {useParams} = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});

		const {getByText} = render(<IssueCreator {...defaultProps} />);
		fireEvent.click(getByText('Return to Lobby'));

		expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
	});
});
