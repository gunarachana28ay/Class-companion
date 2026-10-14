import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import '../ModeratorDashboard.css';

const baseURL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
    baseURL,
});

const getMediaRequestDetail = async (media_id) => {
    try {
        const response = await axiosInstance.get(`/users/multimedia-details/${media_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching media request detail:', error);
        throw error;
    }
};

const approveMediaRequest = async (media_id) => {
    try {
        const response = await axiosInstance.post('/users/approve-multimedia', {
            mediaId: media_id,
        });
        return response.data;
    } catch (error) {
        console.error('Error approving media request:', error);
        throw error;
    }
};

const rejectMediaRequest = async (media_id) => {
    try {
        const response = await axiosInstance.post('/users/reject-multimedia', {
            mediaId: media_id,
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting media request:', error);
        throw error;
    }
};

const mediaTypes = {
    PDF: 'pdf',
    PIC: 'pic'
}

const MediaRequestDetail = () => {
    const { media_id } = useParams();
    const navigate = useNavigate();
    const [mediaRequest, setMediaRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const mediaType = useMemo(() => {
        const filePath = mediaRequest?.file;
        if (!filePath) return;

        const fileExtension = filePath.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return mediaTypes.PIC;
        } else if (fileExtension === 'pdf') {
            return mediaTypes.PDF;
        }
    }, [mediaRequest])

    useEffect(() => {
        const fetchMediaRequestDetail = async () => {
            try {
                const data = await getMediaRequestDetail(media_id);
                setMediaRequest(data);
            } catch (error) {
                setError('Failed to fetch media request detail');
                toast.error('Failed to fetch media request detail');
            } finally {
                setLoading(false);
            }
        };

        fetchMediaRequestDetail();
    }, [media_id]);

    const handleApprove = async () => {
        try {
            await approveMediaRequest(media_id);
            toast.success('Media request approved successfully');
            setIsButtonDisabled(true);
            navigate("/moderator");
        } catch (error) {
            setError('Failed to approve media request');
            toast.error('Failed to approve media request');
        }
    };

    const handleReject = async () => {
        try {
            await rejectMediaRequest(media_id);
            toast.success('Media request rejected successfully');
            setIsButtonDisabled(true);
            navigate("/moderator");
        } catch (error) {
            setError('Failed to reject media request');
            toast.error('Failed to reject media request');
        }
    };

    const renderMedia = (filePath) => {

        const fileExtension = filePath.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {

            return <img src={filePath} alt="Media" className="media-thumbnail" />;

        } else if (fileExtension === 'pdf') {

            return <iframe src={filePath} className="media-pdf h-full w-full" title="Media PDF" />;

        } else {

            return <p>Unsupported file type</p>;

        }

    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="media-request-detail flex flex-col justify-center items-center gap-4 h-full w-full">
            <h2 class="text-4xl font-extrabold">Media Request Detail</h2>
            {mediaRequest && (
                <div className='flex flex-col justify-center items-center gap-4 h-full w-full'>
                    <div className={`media-container ${mediaType == mediaTypes.PDF ? "w-full flex-1" : "max-h-80 max-w-80"}`}>
                        {renderMedia(mediaRequest.file)}
                    </div>
                    <div className="media-info text-start">
                        <p><strong>Username:</strong> {mediaRequest.user.username}</p>
                        <p><strong>Full Name:</strong> {mediaRequest.user.fullname}</p>
                        <p><strong>Email:</strong> {mediaRequest.user.email}</p>
                        <p><strong>Media Type:</strong> {mediaRequest.media_type}</p>
                        <p><strong>Uploaded At:</strong> {mediaRequest.uploaded_at}</p>
                        <div className='w-full flex flex-row items-center my-6 justify-end gap-3'>
                            <button
                                className={`approve-button text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none ${isButtonDisabled ? 'disabled' : ''} wf`}
                                onClick={handleApprove}
                                disabled={isButtonDisabled}
                            >
                                Approve
                            </button>
                            <button
                                className={`reject-button text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none ${isButtonDisabled ? 'disabled' : ''} wf`}
                                onClick={handleReject}
                                disabled={isButtonDisabled}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaRequestDetail;
