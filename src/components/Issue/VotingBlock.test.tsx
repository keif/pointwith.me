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
		const { getAllByRole } = render(
			<VotingBlock onClick={mockOnClick} isLocked={false} userVote={null} />
		);

		// Check if the component renders the correct number of voting buttons
		// 8 fibonacci values + 1 abstain button = 9 total
		const buttons = getAllByRole('button');
		expect(buttons).toHaveLength(9);

		// Check that specific vote values are present in button text content
		const allText = buttons.map(btn => btn.textContent || '').join(' ');
		expect(allText).toContain('1');
		expect(allText).toContain('2');
		expect(allText).toContain('3');
		expect(allText).toContain('5');
		expect(allText).toContain('8');
	});

	test('handles click event to show selected card', () => {
		// Render the component
		const { getAllByRole } = render(
			<VotingBlock onClick={mockOnClick} isLocked={false} userVote={null} />
		);

		// Find the button with value 5 (buttons contain both the number and keyboard hint)
		const buttons = getAllByRole('button');
		const button5 = buttons.find(btn => btn.textContent?.startsWith('5'));

		// Simulate a click event on the card
		fireEvent.click(button5!);

		// Check if the onClick function is called with the correct argument
		expect(mockOnClick).toHaveBeenCalledWith(5);

		// Check if the card with the selected value has success (green) styling
		expect(button5!.className).toContain('bg-success');
		expect(button5!.className).toContain('scale-105');
	});
});
