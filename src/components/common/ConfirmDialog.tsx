import React, { useState } from 'react';
import type { FC } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Dialog title */
    title?: string;
    /** Confirmation message */
    message: string;
    /** Text for confirm button */
    confirmText?: string;
    /** Text for cancel button */
    cancelText?: string;
    /** CSS classes for confirm button */
    confirmButtonClass?: string;
    /** Callback when user confirms */
    onConfirm: () => void;
    /** Callback when user cancels */
    onCancel: () => void;
    /** Whether to show "don't ask again" checkbox */
    showDontAskAgain?: boolean;
    /** localStorage key for "don't ask again" preference */
    dontAskAgainKey?: string;
}

/**
 * Reusable confirmation dialog component
 */
const ConfirmDialog: FC<ConfirmDialogProps> = ({
    isOpen,
    title = 'Confirm Action',
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmButtonClass = 'bg-danger hover:bg-red-600',
    onConfirm,
    onCancel,
    showDontAskAgain = true,
    dontAskAgainKey,
}) => {
    const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleConfirm = (): void => {
        if (dontAskAgain && dontAskAgainKey) {
            localStorage.setItem(dontAskAgainKey, 'true');
        }
        onConfirm();
    };

    const handleCancel = (): void => {
        setDontAskAgain(false);
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="text-danger" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{message}</p>

                    {showDontAskAgain && dontAskAgainKey && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={dontAskAgain}
                                onChange={(e) => setDontAskAgain(e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">Don't ask me again</span>
                        </label>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
