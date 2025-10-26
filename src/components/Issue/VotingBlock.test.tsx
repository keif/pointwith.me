// Import necessary testing libraries and dependencies
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VotingBlock from './VotingBlock';

// Mock the fibonacci function to return a predefined sequence for testing
vi.mock('../../utils/fibonacci', () => ({
	default: vi.fn(() => [1, 2, 3, 5, 8, 13, 21, 34])
}));

// Mock function for onClick
const mockOnClick = vi.fn();

describe('VotingBlock component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders correctly', () => {
		// Render the component
		const { getByText } = render(
			<VotingBlock onClick={mockOnClick} isLocked={false} userVote={null} />
		);

		// Check if the component renders with the correct points
		expect(getByText('1')).toBeInTheDocument();
		expect(getByText('2')).toBeInTheDocument();
		expect(getByText('3')).toBeInTheDocument();
		expect(getByText('5')).toBeInTheDocument();
		expect(getByText('8')).toBeInTheDocument();
	});

	test('handles click event to show selected card', () => {
		// Render the component
		const { getByText, getByTestId } = render(
			<VotingBlock onClick={mockOnClick} isLocked={false} userVote={null} />
		);

		// Simulate a click event on a card
		fireEvent.click(getByText('5'));

		// Check if the onClick function is called with the correct argument
		expect(mockOnClick).toHaveBeenCalledWith(5);

		// Check if the card with the selected value has success (green) styling
		const button = getByText('5');
		expect(button.className).toContain('bg-success');
		expect(button.className).toContain('scale-105');
	});
});
