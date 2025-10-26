import React, {lazy, Suspense} from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';

import Login from '../components/Login';
import '../style.css';

// Lazy load route components
const Dashboard = lazy(() => import('../components/Dashboard'));
const PokerTable = lazy(() => import('../components/PokerTable'));
const About = lazy(() => import('../components/About'));
const Settings = lazy(() => import('../components/Settings'));

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
        </div>
    </div>
);

const router = createBrowserRouter([
    {path: "/", Component: Login},
    {
        path: "/about",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <About/>
            </Suspense>
        )
    },
    {
        path: "/dashboard",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <Dashboard/>
            </Suspense>
        )
    },
    {
        path: "/table/:userId/:tableId",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <PokerTable/>
            </Suspense>
        )
    },
    {
        path: "/settings",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <Settings/>
            </Suspense>
        )
    },
])

const App = () => {
    return (
        <>
            <RouterProvider router={router}/>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    // Default options
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    // Success
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#21ba45',
                            secondary: '#fff',
                        },
                    },
                    // Error
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#db2828',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;
