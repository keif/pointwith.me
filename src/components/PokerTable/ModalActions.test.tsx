import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import ModalActions from './ModalActions';

describe('ModalActions Component', () => {
	test('calls onClose when Close button is clicked', () => {
		const mockOnClose = vi.fn();
		const mockOnNext = vi.fn();
		const { getByText } = render(<ModalActions onClose={mockOnClose} onNext={mockOnNext} nextIssue={false} />);

		fireEvent.click(getByText('Close'));
		expect(mockOnClose).toHaveBeenCalled();
	});

	test('calls onNext with nextIssue when Next button is clicked', () => {
		const mockOnNext = vi.fn();
		const mockOnClose = vi.fn();
		const { getByText } = render(<ModalActions onNext={mockOnNext} onClose={mockOnClose} nextIssue={'nextIssueId'} />);

		fireEvent.click(getByText('Next'));
		expect(mockOnNext).toHaveBeenCalledWith('nextIssueId');
	});

	test('Next button is disabled when nextIssue is not provided', () => {
		const mockOnNext = vi.fn();
		const mockOnClose = vi.fn();
		const { getByText } = render(<ModalActions onNext={mockOnNext} onClose={mockOnClose} nextIssue={false} />);

		expect(getByText('Next').closest('button')).toBeDisabled();
	});
});
