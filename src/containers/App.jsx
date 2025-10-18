import React from 'react';
import {BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';

import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import PokerTable from '../components/PokerTable';
import About from '../components/About';
import withAuthentication from '../containers/withAuthentication';
import '../style.css';

const router = createBrowserRouter([
    {path: "/", Component: Login},
    {path: "/about", Component: About},
    {path: "/dashboard", Component: Dashboard},
    {path: "/table/:userId/:tableId", Component: PokerTable},
])

const App = () => {
    return (
        <>
            <RouterProvider router={router} />
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
