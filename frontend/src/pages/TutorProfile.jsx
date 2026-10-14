import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../context/UserContext";
import useAxios from "../api/axiosConfig";
import StarRating, { starRatingMode } from "../components/star";
// import { PaperClipIcon } from '@heroicons/react/20/solid';

const baseURL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL,
});

const getTutorDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/profile?id=${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching media request detail:", error);
    throw error;
  }
};

const TutorProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(null);
  const { userData } = useContext(UserContext);
  const axiosHttpInstance = useAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorRequestDetail = async () => {
      try {
        const tutorDetail = await getTutorDetails(id);
        setUser(tutorDetail);
      } catch (error) {
        setError("Failed to fetch tutor request detail");
        toast.error("Failed to fetch tutor request detail");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorRequestDetail();
  }, [id]);

  const handleChatClick = async () => {
    const response = await axiosHttpInstance.get('/get_personal_chat_id', {
      params: { user1: userData.id, user2: id } // Pass username to API call if needed
    });
    const roomId = response.data?.data?.id;
    navigate(`/chat/${roomId}`);
  };

  const handleBookAppointmentClick = () => {
    navigate(`/appointment/${id}`)
  }


  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <div className="rounded-full overflow-hidden w-24 h-24 mb-4">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 mx-4">
              <hr className="border-black-300" />
            </div>
            <div className="w-full flex flex-row">
              <div className="w-1/2 bg-white p-6 rounded-lg shadow-md mr-2">
                <h3 className="text-lg font-semibold text-gray-900">Bio</h3>
                <p className="text-sm text-gray-700 mt-2">{user.bio || "N/A"}</p>
              </div>
              <div className="w-1/2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Intro</h3>
                <div className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Name</h4>
                      <p className="text-sm text-gray-900">{user.username}</p>
                    </div>
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Birth Date</h4>
                      <p className="text-sm text-gray-900">{user.birthdate}</p>
                    </div>
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Contact Details</h4>
                      <p className="text-sm text-gray-900">{user.contact_details}</p>
                    </div>
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                      <p className="text-sm text-gray-900">{user.subject}</p>
                    </div>
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Experience</h4>
                      <p className="text-sm text-gray-900">{user.experience}</p>
                    </div>
                  </div>
                  <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200 mt-4">
                    {user.cv ? (
                      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                          {/* <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" /> */}
                          <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">CV</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a href={user.cv} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Download
                          </a>
                        </div>
                      </li>
                    ) : (
                      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                          {/* <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" /> */}
                          <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">No CV available</span>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="rating flex flex-row justify-end w-full">
              <StarRating rating={Math.floor(user.rating)} mode={starRatingMode.EIDTABLE} tutorId={user.id} />
            </div>
            <div className="w-full flex justify-end">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" style={{ marginRight: '20px' }} onClick={handleBookAppointmentClick}>Book Appointment</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleChatClick}>Message</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorProfile;
