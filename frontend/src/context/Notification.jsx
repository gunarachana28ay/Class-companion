import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import UserContext from './UserContext';

const NotificationContext = createContext();

const isChatRoute = /^\/chat\/\d+$/;

export const NotificationProvider = ({ children }) => {
    const location = useLocation();
    const [chatSocket, setChatSocket] = useState();
    const { userData } = useContext(UserContext);
    const [ notificationCount, setNotificationCount ] = useState();

    const shouldConnect = !isChatRoute.test(location.pathname);
    const loggedInUserId = useMemo(() => userData?.id, [userData])

    useEffect(() => {
        if (shouldConnect) {
            const cs = new WebSocket(`${process.env.REACT_APP_WS_NS_URL}/?user_id=${loggedInUserId}`);
            console.log("Notification websocket connection sucessfull");

            cs.onmessage = (e) => {
                const data = JSON.parse(e.data);
                const count = data.message;
                setNotificationCount(count);
            }

            setChatSocket(cs);
        } else {
            if (chatSocket) {
                chatSocket.close();
                console.log("Notification websocket connection closed!");
            }
        }
    }, [shouldConnect, loggedInUserId])

    const contextValue = { notificationCount };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
