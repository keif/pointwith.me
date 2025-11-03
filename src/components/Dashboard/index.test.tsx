import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Dashboard } from './index';
import { MemoryRouter } from 'react-router-dom';

// Mock necessary modules and functions
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
		const {getByText} = render(
			<MemoryRouter>
				<Dashboard/>
			</MemoryRouter>
		);

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

		// Click the delete button - this opens confirmation dialog
		fireEvent.click(getByTestId('delete-button'));

		// Wait for confirmation dialog to appear and confirm deletion
		await waitFor(() => {
			expect(getByText('Delete Poker Table')).toBeInTheDocument();
		});

		// Click the confirm button
		const confirmButton = getByText('Delete Table');
		fireEvent.click(confirmButton);

		// Verify that the poker table is deleted
		await waitFor(() => {
			expect(remove).toHaveBeenCalledWith('randomuserstring');
		});
	});

	// Add more tests based on your specific requirements
});
