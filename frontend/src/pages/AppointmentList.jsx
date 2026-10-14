import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../api/axiosConfig';
import UserContext from '../context/UserContext';

export default function BookedAppointments() {
    const axiosInstance = useAxios();
    const { userData } = useContext(UserContext);
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setAppointmentsLoading(true);
            try {
                const resAppointments = await axiosInstance.get('/get_scheduled_appointments');
                setAppointments(resAppointments.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setAppointmentsLoading(false);
            }
        };

        fetchData();
    }, [axiosInstance]);

    const handleAccept = async (appointmentId) => {
        try {
            await axiosInstance.post('/approve_appointment/', { appointment_id: appointmentId, is_approved: 'true' });
            const resAppointments = await axiosInstance.get('/get_scheduled_appointments');
            setAppointments(resAppointments.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecline = async (appointmentId) => {
        try {
            await axiosInstance.post('/approve_appointment/', { appointment_id: appointmentId, is_approved: 'false' });
            const resAppointments = await axiosInstance.get('/get_scheduled_appointments');
            setAppointments(resAppointments.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAvailability = () => {
        navigate('/add-availability'); // Navigate to the AddAvailability page
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-7xl relative">
                {userData.user_type.toLowerCase() === 'tutor' && (
                    <div className="absolute top-6 right-6">
                        <button
                            onClick={handleAddAvailability}
                            className="bg-blue-400 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-300 transition duration-150 ease-in-out"
                        >
                            Add Appointment Availability
                        </button>
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 text-center">
                    Booked Appointments
                </h2>
                {appointmentsLoading ? (
                    <div className="w-full flex justify-center items-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {appointments.length > 0 ? (
                                appointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        user_type={userData.user_type}
                                        onAccept={() => handleAccept(appointment.id)}
                                        onDecline={() => handleDecline(appointment.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-center col-span-full">No appointments booked</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const AppointmentCard = ({ appointment, user_type, onAccept, onDecline }) => {
    const date = new Date(appointment.time);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
    const startTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });
    const endTime = new Date(date.getTime() + 45 * 60000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });

    return (
        <div className="flex flex-col bg-white shadow-lg rounded-lg p-4 m-2 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col h-full">
                <h3 className="text-md md:text-lg font-medium mb-1 text-gray-800">
                    {user_type.toLowerCase() === 'tutor'
                        ? `${appointment.tutor.first_name} ${appointment.tutor.last_name}`
                        : `${appointment.student.first_name} ${appointment.student.last_name}`}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                    {`${formattedDate} - ${startTime} to ${endTime}`}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                    Confirmation Status: {appointment.status}
                </p>
                {user_type.toLowerCase() === 'tutor' && appointment.status === 'PENDING' && (
                    <div className="flex flex-col md:flex-row justify-between mt-auto">
                        <button
                            onClick={onAccept}
                            className="bg-green-500 text-white px-3 py-1.5 rounded-md mb-2 md:mb-0 md:mr-2 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onDecline}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-md mb-2 md:mb-0 md:mr-2 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
