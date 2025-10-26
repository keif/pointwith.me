import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Login from './index';

// Mocks
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useParams: vi.fn(() => ({})),
		useNavigate: vi.fn(() => vi.fn())
	};
});

vi.mock('store', () => ({
	default: {
		get: vi.fn(),
		remove: vi.fn()
	}
}));

vi.mock('@/firebase', () => ({
	auth: {
		auth: {
			onAuthStateChanged: vi.fn(() => vi.fn()) // Return unsubscribe function
		}
	}
}));

vi.mock('@/containers/Layout', () => ({
	default: ({ children }: any) => <div data-testid="layout">{children}</div>
}));

vi.mock('../SocialButtonList', () => ({
	default: () => <div data-testid="social-button-list"></div>
}));

vi.mock('../AnonymousLogin', () => ({
	default: () => <div data-testid="anonymous-login"></div>
}));

describe('Login Component', () => {
	test('renders Login component', async () => {
		const { useParams } = await import('react-router-dom');
		vi.mocked(useParams).mockReturnValue({});

		const { getByText } = render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);
		expect(getByText("Sign In - It's FREE")).toBeInTheDocument();
	});

	test('navigates based on authentication state', async () => {
		const { auth } = await import('@/firebase');
		const store = (await import('store')).default;

		const mockUser = { uid: '123' };
		vi.mocked(auth.auth.onAuthStateChanged).mockImplementationOnce((callback: any) => {
			callback(mockUser);
			return vi.fn(); // Return unsubscribe function
		});
		vi.mocked(store.get).mockImplementationOnce(() => '/dashboard');

		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		// Verify navigation logic
		await waitFor(() => {
			expect(store.get).toHaveBeenCalledWith('entryPoint');
		});
	});

	// Additional tests for different scenarios (e.g., user not authenticated)
});

