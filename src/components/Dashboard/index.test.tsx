import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Dashboard } from './index';
import { MemoryRouter } from 'react-router-dom';

// Mock necessary modules and functions
vi.mock('firebase/database', () => ({
	onValue: vi.fn(),
	set: vi.fn()
}));

vi.mock('@/containers/Layout', () => ({
	default: ({ children }: any) => <div data-testid="layout-test">{children}</div>
}));

vi.mock('@/firebase', () => ({
	auth: {
		get auth() {
			return {
				currentUser: { uid: 'testUserId', displayName: 'Test User' }
			};
		}
	},
	db: {
		pokerTables: vi.fn((userId: string) => ({
			path: `pokerTables/${userId}`
		})),
		pokerTable: vi.fn((userId: string, tableId: string) => ({
			path: `pokerTable/${userId}/${tableId}`
		}))
	}
}));

vi.mock('@/api/pokerTables', () => ({
	createClient: vi.fn(() => ({
		remove: vi.fn()
	}))
}));

vi.mock('date-fns', () => ({
	format: vi.fn((date: any, formatStr: any) => {
		return new Date(date).toLocaleString();
	})
}));

vi.mock('shortid', () => ({
	default: {
		generate: vi.fn(() => 'testTableId')
	}
}));

describe('Dashboard Page', () => {
	test('renders Dashboard component', async () => {
		// Render the component
		const {getByText} = render(<Dashboard/>);

		// Verify that the component renders correctly
		expect(getByText('Your Poker Tables')).toBeInTheDocument();
	});

	test('deletes a poker table when the delete button is clicked', async () => {
		const { onValue, set } = await import('firebase/database');
		const pokerTablesApi = await import('@/api/pokerTables');

		// Mock necessary functions
		const remove = vi.fn();
		vi.mocked(onValue).mockImplementationOnce((ref: any, callback: any) => {
			const snapshot = {
				exists: vi.fn(() => true),
				val: vi.fn(() => ({
					'randomuserstring': {
						tableName: 'Test Table',
						created: 'Fri Nov 17 2023 22:31:08 GMT-0500 (Eastern Standard Time)'
					}
				}))
			};
			callback(snapshot);
			return vi.fn(); // Return unsubscribe
		});
		vi.mocked(set).mockImplementationOnce(() => Promise.resolve());
		vi.mocked(pokerTablesApi.createClient).mockImplementation(() => ({ remove }) as any);

		// Render the component inside memory router
		const {getByTestId, getByText, queryByText} = await render(
			<MemoryRouter>
				<Dashboard/>
			</MemoryRouter>
		);

		// Wait for data to be loaded
		await waitFor(() => {
			expect(getByText('Test Table')).toBeInTheDocument();
		});

		// Click the delete button
		fireEvent.click(getByTestId('delete-button'));

		// Verify that the poker table is deleted optimistically
		expect(remove).toHaveBeenCalledWith('randomuserstring');

		// Verify that the poker table is removed from the UI
		await waitFor(() => {
			const table = queryByText('Test Table');
			expect(table).not.toBeInTheDocument();
		});
	});

	// Add more tests based on your specific requirements
});
