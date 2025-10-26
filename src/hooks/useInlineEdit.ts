import { useState, KeyboardEvent } from 'react';
import toast from 'react-hot-toast';

interface UseInlineEditOptions {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  maxLength?: number;
  emptyErrorMessage?: string;
  maxLengthErrorMessage?: string;
}

interface UseInlineEditReturn {
  isEditing: boolean;
  editedValue: string;
  setEditedValue: (value: string) => void;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for managing inline editing state and behavior.
 *
 * @param options - Configuration options for inline editing
 * @returns Object containing editing state and handler functions
 *
 * @example
 * ```tsx
 * const {
 *   isEditing,
 *   editedValue,
 *   setEditedValue,
 *   handleStartEdit,
 *   handleCancelEdit,
 *   handleSaveEdit,
 *   handleKeyDown
 * } = useInlineEdit({
 *   initialValue: title,
 *   onSave: async (newTitle) => {
 *     await update(ref, { title: newTitle });
 *   },
 *   maxLength: 200,
 *   emptyErrorMessage: 'Title cannot be empty',
 *   maxLengthErrorMessage: 'Title must be 200 characters or less'
 * });
 * ```
 */
export const useInlineEdit = ({
  initialValue,
  onSave,
  maxLength = 200,
  emptyErrorMessage = 'Value cannot be empty',
  maxLengthErrorMessage = `Value must be ${maxLength} characters or less`,
}: UseInlineEditOptions): UseInlineEditReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue);

  const handleStartEdit = () => {
    setEditedValue(initialValue);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedValue(initialValue);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editedValue.trim();

    if (!trimmedValue) {
      toast.error(emptyErrorMessage);
      return;
    }

    if (maxLength && trimmedValue.length > maxLength) {
      toast.error(maxLengthErrorMessage);
      return;
    }

    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      // Revert on error
      setEditedValue(initialValue);
      // Error is handled by the caller (typically via toast.promise)
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return {
    isEditing,
    editedValue,
    setEditedValue,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleKeyDown,
  };
};
