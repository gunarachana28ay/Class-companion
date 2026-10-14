import axios from 'axios';

const API_URL = 'http://localhost:8000/api/profile/';

const getProfile = async () => {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data;
};

const updateProfile = async (profileData) => {
    const response = await axios.put(API_URL, profileData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export { getProfile, updateProfile };
