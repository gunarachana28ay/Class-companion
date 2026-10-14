// Layout.js
import React from 'react';
import NavBar from './NavBar';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationProvider } from '../context/Notification';

const navbarHiddenRoute = [
    "/login",
    "/signup"
]

const Layout = () => {
    const location = useLocation();

    return (
        <NotificationProvider>
            <div className='flex flex-col h-screen'>
                {
                    navbarHiddenRoute.includes(location.pathname) ? <></> :
                        <NavBar />
                }
                <main className='max-w-7xl mx-auto w-full flex-1'>
                    <Outlet /> {/* this is where all the children components from createBrowserRouter will be rendered */}
                </main>
            </div>
        </NotificationProvider>
    );
};

export default Layout;