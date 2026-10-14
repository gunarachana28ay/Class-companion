import axios from 'axios';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo } from 'react';
import UserContext from '../context/UserContext';
import { useJwt } from 'react-jwt'; // Correct import statement for useJwt

const baseURL = process.env.REACT_APP_API_URL; // Your Django API base URL

const useAxios = () => {
    const { authTokens, setAuthTokens } = useContext(UserContext);
    const { decodedToken, isExpired, reEvaluateToken } = useJwt(authTokens?.access); // Ensure authTokens?.access is passed to useJwt

    const axiosInstance = useMemo(() => axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}` }
    }), [authTokens?.access]);

    useEffect(() => {
        if (!decodedToken) return;

        axiosInstance.interceptors.request.use(
            async req => {
                if (!authTokens) return req;

                const user = decodedToken; // Correct usage of decodedToken
                const expired = dayjs.unix(user.exp).diff(dayjs()) < 0; // Adjusted logic for expiration check

                if (!expired) return req;

                try {
                    const response = await axios.post(`${baseURL}/login/refresh/`, {
                        refresh: authTokens.refresh
                    });

                    const newTokens = {
                        ...authTokens,
                        access: response.data.access
                    };

                    setAuthTokens(newTokens);
                    localStorage.setItem('authTokens', JSON.stringify(newTokens));

                    req.headers.Authorization = `Bearer ${response.data.access}`;

                    reEvaluateToken(response.data.access); // Update the token in react-jwt
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                    // Handle refresh token failure as needed
                }
                return req;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }, [decodedToken])

    return axiosInstance;
};

export default useAxios;
