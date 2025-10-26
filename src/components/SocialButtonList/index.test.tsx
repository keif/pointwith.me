// Mocks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('../../firebase/auth', () => ({
    ...jest.requireActual('../../firebase/auth'),
    githubOAuth: jest.fn(() => ({ /* mock properties and methods as needed */})),
    googleOAuth: jest.fn(() => ({ /* mock properties and methods as needed */})),
    azureOAuth: jest.fn(() => ({ /* mock properties and methods as needed */})),
    popUpSignIn: jest.fn(() => Promise.resolve({user: {providerData: ['provider']}})),
}));

import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import SocialButtonList from './index';
import {azureOAuth, githubOAuth, googleOAuth, popUpSignIn} from '../../firebase/auth';
import {mockedNavigator} from '../../setupTests';

describe('SocialButtonList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders visible buttons correctly', () => {
        const {getByText} = render(<SocialButtonList currentUser={null}/>);

		expect(getByText(/github/i)).toBeInTheDocument()
		expect(getByText(/google/i)).toBeInTheDocument()
		expect(getByText(/microsoft/i)).toBeInTheDocument()
        // Anonymous button is not visible
    });

    test('button click initiates authentication', async () => {
        popUpSignIn.mockResolvedValueOnce({user: {providerData: ['provider']}});
        const {getByText} = render(<SocialButtonList currentUser={null}/>);
        fireEvent.click(getByText('google'));

		await waitFor(() => expect(popUpSignIn).toHaveBeenCalled());
		await waitFor(() => expect(googleOAuth).toHaveBeenCalled());
    });

    test.skip('navigates to dashboard after successful authentication', async () => {
        popUpSignIn.mockResolvedValueOnce({user: {providerData: ['provider']}});
        const {getByText} = render(<SocialButtonList currentUser={null}/>);
        fireEvent.click(getByText('google'));

        await expect(mockedNavigator).toHaveBeenCalledWith('/dashboard');
    });
});
