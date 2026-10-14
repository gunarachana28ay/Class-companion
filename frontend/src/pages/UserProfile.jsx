import React, { useContext, useState } from 'react';
import UserContext from '../context/UserContext';
import useAxios from '../api/axiosConfig';
import { toast } from 'react-toastify';

const UserProfile = () => {
    const { userData, setUserDtaFromApi, authTokens } = useContext(UserContext);

    const [editMode, setEditMode] = useState(false);
    const [editedFields, setEditedFields] = useState({
        experience: userData?.experience,
        subject: userData?.subject,
        bio: userData?.bio,
        contact_details: userData?.contact_details,
    });
    const axiosHttpInstance = useAxios();

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setEditedFields({ ...editedFields, [name]: value });
    };

    const handleMediaUpload = async (file, media_type) => {
        if (!file) {
            console.error('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("media_type", media_type);
        console.log(formData)

        try {
            const response = await axiosHttpInstance.post('/profile/upload-new-media', formData);
            const data = await response?.data;

            if (!`${response.status}`.startsWith("2")) {
                throw new Error(`Error: ${data.message || response.statusText || "Something went wrong"}`);
            }

            toast.success("Media updated sucessfully. Please wait for review from moderator.")
        } catch (error) {
            console.error(`Error uploading ${media_type}:`, error);
            alert(`Error uploading ${media_type}: ${error.message}`);
        }
    };

    const handleFileUpload = (e, media_type) => {
        const file = e.target.files[0];
        handleMediaUpload(file, media_type);
    };

    const handleSubmit = async () => {
        try {
            const updatedUserData = {
                ...userData,
                ...editedFields
            };

            const response = await axiosHttpInstance.patch('/profile/', {
                contact_details: updatedUserData?.contact_details,
                experience: updatedUserData?.experience,
                bio: updatedUserData?.bio,
                subject: updatedUserData?.subject
            });
            if (response.status == 200) {
                await setUserDtaFromApi(updatedUserData);
                toggleEditMode();
            } else {
                console.error('Failed to update user data:', response.error);
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 py-5 ml-13 px-3 relative">
                            <div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <div className={`relative ${editMode ? 'group' : ''} h-40 w-40 m-auto`}>
                                    <img
                                        src={editedFields?.profile_picture || userData?.profile_picture}
                                        alt="Profile"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                    {editMode && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                            <label
                                                htmlFor="profilePictureInput"
                                                className="text-white cursor-pointer"
                                            >
                                                Change Profile Photo
                                            </label>
                                            <input
                                                id="profilePictureInput"
                                                type="file"
                                                name="profile_picture"
                                                onChange={(e) => handleFileUpload(e, 'profile_picture')}
                                                className="hidden"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {editMode ? (
                            <>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="text"
                                            name="username"
                                            value={userData?.username}
                                            readOnly
                                            className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm "
                                        />
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="text"
                                            name="email"
                                            value={userData?.email}
                                            readOnly
                                            className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        />
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="text"
                                            name="firstname"
                                            value={userData?.firstname}
                                            readOnly
                                            className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        />
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="text"
                                            name="lastname"
                                            value={userData?.lastname}
                                            readOnly
                                            className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        />
                                    </dd>
                                </div>

                                {userData?.user_type.toLowerCase() === "tutor" && (
                                    <>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Contact Details</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    name="contact_details"
                                                    value={editedFields?.contact_details}
                                                    onChange={handleFieldChange}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Experience</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    name="experience"
                                                    value={editedFields?.experience}
                                                    onChange={handleFieldChange}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Bio</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <textarea
                                                    name="bio"
                                                    value={editedFields?.bio}
                                                    onChange={handleFieldChange}
                                                    rows={3}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Subject</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={editedFields?.subject}
                                                    onChange={handleFieldChange}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">CV</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="file"
                                                    name="cv"
                                                    onChange={(e) => handleFileUpload(e, 'cv')}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </dd>
                                        </div>
                                    </>)}

                            </>
                        ) : (
                            <>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.username}</dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.email}</dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.firstname}</dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.lastname}</dd>
                                </div>
                                {userData?.user_type.toLowerCase() === "tutor" && (
                                    <>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Contact Details</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.contact_details}</dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Experience</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.experience}</dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Bio</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.bio}</dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Subject</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userData?.subject}</dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">CV</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <button
                                                    onClick={() => window.open(userData?.cv, '_blank')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                    View CV
                                                </button>
                                            </dd>
                                        </div>
                                    </>)}

                            </>
                        )}
                    </dl>
                    {/* Render edit button */}
                    <div className="bg-white px-4 py-3 sm:px-6">
                        <button
                            onClick={editMode ? handleSubmit : toggleEditMode}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${editMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {editMode ? 'Save' : 'Edit'}
                        </button>
                    </div>
                    {/* End edit button */}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
