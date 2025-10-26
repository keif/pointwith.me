import React from 'react';
import { render } from '@testing-library/react';
import Layout from './Layout';
import { auth } from '../firebase';
import { BrowserRouter } from 'react-router-dom';

// Mocks
jest.mock('../firebase', () => ({
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

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: jest.fn()
}));

describe('Layout Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		const { useParams } = require('react-router-dom');
		useParams.mockReturnValue({ userId: 'testUserId' });
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
		expect(getByText('Test User - ATTENDEE')).toBeInTheDocument();
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
