import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export const ErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage: string;
    let errorTitle: string = 'Unexpected Error';
    let showReload: boolean = false;

    if (isRouteErrorResponse(error)) {
        errorTitle = `${error.status} ${error.statusText}`;
        errorMessage = error.data?.message || 'Page not found';
    } else if (error instanceof Error) {
        errorMessage = error.message;

        // Detect chunk loading errors (often due to deployments)
        if (error.message.includes('dynamically imported module') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('ChunkLoadError')) {
            errorTitle = 'App Update Available';
            errorMessage = 'A new version of the app is available. Please reload the page.';
            showReload = true;
        }
    } else {
        errorMessage = 'An unexpected error occurred';
    }

    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 text-red-500 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {errorTitle}
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {errorMessage}
                    </p>

                    <div className="flex flex-col gap-3">
                        {showReload && (
                            <button
                                onClick={handleReload}
                                className="btn btn-primary w-full"
                            >
                                Reload Page
                            </button>
                        )}

                        <button
                            onClick={handleGoHome}
                            className="btn btn-secondary w-full"
                        >
                            Go to Home
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && error instanceof Error && (
                        <details className="mt-6 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                Error Details (Dev Only)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                                {error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;
