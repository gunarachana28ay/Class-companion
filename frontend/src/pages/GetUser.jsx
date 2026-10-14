import React, { useContext, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../context/UserContext';
import useAxios from '../api/axiosConfig';

export const GetDataPage = () => {
    const axiosInstance = useAxios();
    const [userDetails, setUserDetailsX] = useState('');

    const {    userData } = useContext(UserContext); // Extract necessary values from context
    const handleSubmit = async (e) => {
        e.preventDefault();
        const username=userData?.username
        console.log(username)

            try {
                const response = await axiosInstance.get('/get-user-data/', {
                    params: { username } // Pass username to API call if needed
                });
                console.log('User data:', response.data);
                setUserDetailsX(response.data)

              //  setUserDtaFromApi(response.data)
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
       
    };

    return (
        <div>
            {userDetails && (
                <div>
                    <h2>User Data</h2>
                    <p>Username: {userDetails.username}</p>
                    <p>Email: {userDetails.email}</p>
                    {/* Add more fields as needed */}
                </div>
               
            )}
             <button onClick={handleSubmit}>G=Fetch Data</button>
          
        </div>
        
        
    );
};
