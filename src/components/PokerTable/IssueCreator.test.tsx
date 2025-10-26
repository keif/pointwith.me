import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom';
import IssueCreator from './IssueCreator';
import * as reactRouterDom from 'react-router-dom';
import {mockedNavigator} from '../../setupTests';

// Mocks
jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: jest.fn(),
	useNavigate: jest.fn()
}));

jest.mock('@/firebase', () => ({
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
		pokerTable: jest.fn()
	}
}));
jest.mock('./IssueNameForm', () => ({handleIssueSubmit}) => (
	<div data-testid="issue-name-form" onClick={handleIssueSubmit}>
		IssueNameForm
	</div>
));
jest.mock('firebase/database', () => ({
	set: jest.fn(),
	update: jest.fn()
}));

describe('IssueCreator Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		const {useNavigate} = require('react-router-dom');
		useNavigate.mockReturnValue(mockedNavigator);
	});

	test('renders correctly for a non-owner user', () => {
		const {useParams} = require('react-router-dom');
		useParams.mockReturnValue({userId: 'differentUserId', tableId: 'testTableId'});

		const {getByText, queryByTestId} = render(<IssueCreator tableName="Test Table"/>);

		expect(getByText('Test Table')).toBeInTheDocument();
		expect(getByText('Return to Lobby')).toBeInTheDocument();
		expect(queryByTestId('issue-name-form')).not.toBeInTheDocument();
	});

	test('renders correctly for the owner user', () => {
		const {useParams} = require('react-router-dom');
		useParams.mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});

		const {getByText, getByTestId} = render(<IssueCreator tableName="Test Table" onClick={() => {
		}}/>);

		expect(getByText('Test Table')).toBeInTheDocument();
		expect(getByText('Return to Lobby')).toBeInTheDocument();
		expect(getByTestId('issue-name-form')).toBeInTheDocument();
	});

	test('navigates to the dashboard on click', () => {
		const {useParams} = require('react-router-dom');
		useParams.mockReturnValue({userId: 'testUserId', tableId: 'testTableId'});

		const {getByText} = render(<IssueCreator tableName="Test Table" onClick={() => {
		}}/>);
		fireEvent.click(getByText('Return to Lobby'));

		expect(mockedNavigator).toHaveBeenCalledWith('/dashboard');
	});
});
