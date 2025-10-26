import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import Layout from './Layout';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('../firebase', () => ({
	auth: {
		get auth() {
			return {
				currentUser: {
					uid: 'testUserId',
					displayName: 'Test User'
				}
			};
		}
	}
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useParams: vi.fn()
	};
});

describe('Layout Component', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const { useParams } = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({ userId: 'testUserId' });
	});

	test('renders with children and displays user info when authenticated', () => {
		const { getByText } = render(
			<BrowserRouter>
				<Layout>
					<div>Child Component</div>
				</Layout>
			</BrowserRouter>
		);

		expect(getByText('Child Component')).toBeInTheDocument();
		expect(getByText('Test User - HOST')).toBeInTheDocument();
	});

	test('content centering based on prop', () => {
		const { container } = render(
			<BrowserRouter>
				<Layout contentCenter={true}>
					<div>Centered Content</div>
				</Layout>
			</BrowserRouter>
		);

		const mainElement = container.querySelector('main');
		expect(mainElement).toBeInTheDocument();
		expect(mainElement.className).toContain('items-center');
		expect(mainElement.className).toContain('justify-center');
	});

	// Additional tests as needed...
});
