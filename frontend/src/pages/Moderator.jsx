import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Axios Configuration
const baseURL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
    baseURL,
});

// API Functions
const getInactiveTutorsForReview = async () => {
    try {
        const response = await axiosInstance.get('/retrieve_pending_tutors');
        return response.data;
    } catch (error) {
        console.error('Error fetching inactive users:', error);
        throw error;
    }
};

const finalizeUser = async (userId, isApproved) => {
    try {
        const response = await axiosInstance.patch('/finalize_tutors', {
            id: userId,
            isApproved: isApproved.toString()
        });
        return response.data;
    } catch (error) {
        console.error('Error activating user:', error);
        throw error;
    }
};

// New API Function for Media Requests
const getNewMediaRequests = async () => {
    try {
        const response = await axiosInstance.get('/users/new-media-requests');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching new media requests:', error);
        throw error;
    }
};

const TabOptions = {
    PENDING_ACCOUNTS: "pending_accounts",
    PENDING_MEDIA: "pending_media",
}

// Tab Component
const ModeratorDashboard = () => {
    const [activeTab, setActiveTab] = useState(TabOptions.PENDING_ACCOUNTS);
    const [users, setUsers] = useState([]);
    const [mediaRequests, setMediaRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const inactiveTutorsRes = await getInactiveTutorsForReview();
                setUsers(inactiveTutorsRes.data);
            } catch (error) {
                setError('Failed to fetch users');
                toast.error('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        const fetchMediaRequests = async () => {
            try {
                const mediaList = await getNewMediaRequests();
                setMediaRequests(mediaList);
            } catch (error) {
                setError('Failed to fetch media requests');
                toast.error('Failed to fetch media requests');
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === TabOptions.PENDING_ACCOUNTS) {
            fetchUsers();
        } else if (activeTab === TabOptions.PENDING_MEDIA) {
            fetchMediaRequests();
        }
    }, [activeTab]);

    const handleApprove = async (userId) => {
        try {
            await finalizeUser(userId, true);
            setUsers(users.filter((user) => user.id !== userId));
            toast.success('User activated successfully');
        } catch (error) {
            setError('Failed to activate user');
            toast.error('Failed to activate user');
        }
    };

    const handleReject = async (userId) => {
        try {
            await finalizeUser(userId, false);
            setUsers(users.filter((user) => user.id !== userId));
            toast.success('User rejected successfully');
        } catch (error) {
            setError('Failed to reject user');
            toast.error('Failed to reject user');
        }
    };

    return (
        <div className="ModeratorDashboard w-full">
            <div className="w-full">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
                    <li className="me-2">
                        <a href="#" aria-current="page" className={`inline-block p-4 bg-gray-100 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 ${activeTab === TabOptions.PENDING_ACCOUNTS ? "active text-blue-600" : ""}`} onClick={() => { setActiveTab(TabOptions.PENDING_ACCOUNTS) }}>New Users Awaiting Review</a>
                    </li>
                    <li className="me-2">
                        <a href="#" className={`inline-block p-4 rounded-t-lg ${activeTab === TabOptions.PENDING_MEDIA ? "active text-blue-600" : ""}`} onClick={() => { setActiveTab(TabOptions.PENDING_MEDIA) }}>New Media Requests</a>
                    </li>
                </ul>
            </div>

            {activeTab === TabOptions.PENDING_ACCOUNTS && (
                <div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <div className='flex flex-wrap'>
                            {
                                users.map((user, idx) => (
                                    <PendingAccountCard key={`${idx}`} account={user} onApprove={() => handleApprove(user.id)} onReject={() => handleReject(user.id)} />
                                ))
                            }
                        </div>
                    )}
                </div>
            )}

            {activeTab === TabOptions.PENDING_MEDIA && (
                <div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <div class="relative overflow-x-auto">
                            <table className="media-requests-table w-full text-sm text-left rtl:text-right text-gray-500">
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3' scope='col'>Username</th>
                                        <th className='px-6 py-3 hidden md:table-cell' scope='col'>Full Name</th>
                                        <th className='px-6 py-3 hidden md:table-cell' scope='col'>Email</th>
                                        <th className='px-6 py-3' scope='col'>Media Type</th>
                                        <th className='px-6 py-3' scope='col'>Uploaded At</th>
                                        <th className='px-6 py-3' scope='col'>File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mediaRequests.map((request, index) => (
                                        <tr key={index} className='bg-white border-b'>
                                            <th className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap' scope='row'>{request.user.username}</th>
                                            <td className='px-6 py-4 hidden md:table-cell'>{request.user.fullname}</td>
                                            <td className='px-6 py-4 hidden md:table-cell'>{request.user.email}</td>
                                            <td className='px-6 py-4'>{request.media_type}</td>
                                            <td className='px-6 py-4'>{request.uploaded_at}</td>
                                            <td className='px-6 py-4'>
                                                <Link
                                                    to={`/media-request/${request.media_id}`}
                                                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 focus:outline-none w-30 block text-center'
                                                >
                                                    View File
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    )}
                </div>
            )}
        </div>
    );
};

const PendingAccountCard = ({ account, onApprove, onReject }) => {
    return (
        <div className='w-full lg:w-4/12 px-1 py-1'>
            <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4 w-full h-full">
                <img
                    src={account.profile_picture || "/profile_placeholder.jpg"}
                    alt={`${account.first_name}'s profile`}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                />
                <div className="flex-1 text-start">
                    <h2 className="text-xl font-bold text-left">{account.username}</h2>
                    <p className="text-left text-gray-600">{account.email}</p>
                    <div className='flex flex-row justify-between align-end'>
                        {
                            account?.cv ? <a href={account.cv} target="_blank" rel="noopener noreferrer" className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700'>View CV</a> : <div></div>
                        }
                        <div className='flex gap-2'>
                            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700" onClick={onApprove}>Approve</button>
                            <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700" onClick={onReject}>Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorDashboard;
