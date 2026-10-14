import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        const tokens = localStorage.getItem('authTokens');
        return tokens ? JSON.parse(tokens) : null;
    });

    const [userData, setUserData] = useState(() => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    });

    const [shouldReloadUserData, setShouldReloadUserData] = useState(false);

    const setUserDtaFromApi = async (data) => {
        try {
            setUserData(data);
            localStorage.setItem('userData', JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.response ? error.response.data.detail : error.message };
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post(process.env.REACT_APP_API_URL + '/login/', { username, password });
            const tokens = response.data?.data;
            if (tokens) {
                setAuthTokens(tokens);
                localStorage.setItem('authTokens', JSON.stringify(tokens));
            }
            return { success: true, tokens };
        } catch (error) {
            return { success: false, error: error.response ? error.response.data.message : error.message };
        }
    };

    useEffect(() => {
        if (authTokens) {
            setShouldReloadUserData(true);
        }
    }, [authTokens])

    useEffect(() => {
        if (!shouldReloadUserData) return;
        (async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_API_URL + '/my-profile', {
                    headers: { Authorization: `Bearer ${authTokens?.access}` }

                });
                setUserDtaFromApi(response.data?.data)
            } catch (err) {
                console.log(err);
                setUserDtaFromApi(null)
            } finally {
                setShouldReloadUserData(false);
            }
        })()
    }, [shouldReloadUserData])

    const logout = () => {
        setAuthTokens(null);
        localStorage.removeItem('authTokens');
        setUserData(null);
        localStorage.removeItem('userData');
    };

    const contextValue = {
        authTokens,
        setAuthTokens,
        login,
        logout,
        userData, // Provide userData from authTokens,
        setUserData,
        setUserDtaFromApi,
        setShouldReloadUserData
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
