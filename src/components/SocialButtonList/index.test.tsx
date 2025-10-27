import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import { vi } from 'vitest';
import SocialButtonList from './index';
import {mockedNavigator} from '../../setupTests';

// Mocks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../firebase/auth', async () => {
    const actual = await vi.importActual('../../firebase/auth');
    return {
        ...actual,
        githubOAuth: vi.fn(() => ({ /* mock properties and methods as needed */})),
        googleOAuth: vi.fn(() => ({ /* mock properties and methods as needed */})),
        azureOAuth: vi.fn(() => ({ /* mock properties and methods as needed */})),
        popUpSignIn: vi.fn(() => Promise.resolve({user: {providerData: ['provider']}})),
    };
});

describe('SocialButtonList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders visible buttons correctly', () => {
        const {getByText, queryByText} = render(<SocialButtonList currentUser={null}/>);

		expect(getByText(/github/i)).toBeInTheDocument()
		expect(getByText(/google/i)).toBeInTheDocument()
		// Microsoft is currently disabled
		expect(queryByText(/microsoft/i)).not.toBeInTheDocument()
        // Twitter and Facebook buttons are not visible
    });

    test('button click initiates authentication', async () => {
        const { popUpSignIn, googleOAuth } = await import('../../firebase/auth');
        vi.mocked(popUpSignIn).mockResolvedValueOnce({user: {providerData: ['provider']}} as any);

        const {getByText} = render(<SocialButtonList currentUser={null}/>);
        fireEvent.click(getByText(/google/i));

		await waitFor(() => expect(popUpSignIn).toHaveBeenCalled());
		await waitFor(() => expect(googleOAuth).toHaveBeenCalled());
    });

    test.skip('navigates to dashboard after successful authentication', async () => {
        const { popUpSignIn } = await import('../../firebase/auth');
        vi.mocked(popUpSignIn).mockResolvedValueOnce({user: {providerData: ['provider']}} as any);
        const {getByText} = render(<SocialButtonList currentUser={null}/>);
        fireEvent.click(getByText('google'));

        await expect(mockedNavigator).toHaveBeenCalledWith('/dashboard');
    });
});
