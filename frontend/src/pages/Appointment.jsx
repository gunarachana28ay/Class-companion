import React, { useEffect, useState } from 'react';
import useAxios from '../api/axiosConfig';
import { useParams } from 'react-router-dom';

const processDates = (dates) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const categorizedDates = {
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': [],
        'Saturday': [],
        'Sunday': []
    };

    dates.forEach(dateString => {
        const date = new Date(dateString);
        const dayName = daysOfWeek[date.getUTCDay()];
        categorizedDates[dayName].push(dateString);
    });
    return categorizedDates;
};

const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
};


export default function Appointment() {
    const axiosInstance = useAxios();
    const { tutorId } = useParams();  // Extracts tutorId from the URL
    const [appointmentSlots, setAppointmentSlots] = useState([]);
    const [appointmentSlotsLoading, setAppointmentSlotsLoading] = useState(false);
    const [tutorName, setTutorName] = useState('');
    const [tutorNameLoading, setTutorNameLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setAppointmentSlotsLoading(true);
            setTutorNameLoading(true);
            try {
                const resAppointmentSlots = await axiosInstance.get('/availability', {
                    params: { tutor_id: tutorId, week_number: getCurrentWeekNumber() }
                });
                setAppointmentSlots(resAppointmentSlots.data.data);

                const resTutorProfile = await axiosInstance.get('/profile', {
                    params: { id: tutorId }
                });
                const resTutorData = resTutorProfile.data.data;
                setTutorName(`${resTutorData.firstname} ${resTutorData.lastname}`);
            } catch (err) {
                console.error(err);
            } finally {
                setAppointmentSlotsLoading(false);
                setTutorNameLoading(false);
            }
        };

        fetchData();
    }, [axiosInstance, tutorId]);

    const handleSlotClick = async (slot) => {

        const date = new Date(slot);
        const options = {
            weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', hour12: true,
            timeZone: 'UTC'
        };
        const formattedDate = date.toLocaleDateString('en-US', options);

        const confirmation = window.confirm(`Do you want to book the appointment with ${tutorName} at ${formattedDate}?`);
        if (confirmation) {
            await axiosInstance.post('/book_appointment/', {
                tutor_id: tutorId,
                time: slot
            })
            window.alert('Appointment booking request sent to the tutor.')
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
                    {tutorNameLoading ? 'Loading...' : `Book an Appointment With ${tutorName}`}
                </h2>
                <div className="flex flex-wrap gap-6 justify-center">
                    {
                        appointmentSlotsLoading ?
                            Array.from({ length: 7 }).map((a, idx) => (
                                <div className='w-full px-1 py-1' key={`${idx}`}>
                                    <div className="bg-white rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-6 flex items-start space-x-4 w-full h-full">
                                        <div role="status" class="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                            <div
                                                className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                                            >
                                                <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                                </svg>
                                            </div>
                                            <div class="w-full">
                                                <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                                            </div>
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            Object.entries(processDates(appointmentSlots)).map(([day, slots], index) => (
                                <DayCard key={index} day={day} slots={slots} onClick={(slot) => handleSlotClick(slot)} />
                            ))
                    }
                </div>
            </div>
        </div>
    );
};

const DayCard = ({ day, slots, onClick }) => {
    return (
        <div className="flex flex-col w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-3">
            <div className="flex flex-col flex-1 bg-white shadow-lg rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{day}</h3>
                <hr className="border-t border-gray-300 mb-3" />
                <div className="flex-1 flex flex-col justify-center">
                    {slots.length > 0 ? (
                        slots.map((slot, index) => (
                            <div key={index} onClick={() => onClick(slot)} className="py-2 px-3 mb-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors">
                                <SlotCard slot={slot} />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No Slots Available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const SlotCard = ({ slot }) => {
    const hours = String(new Date(slot).getUTCHours()).padStart(2, '0');
    return (
        <p className="text-gray-700">{`${hours}:00 - ${hours}:45`}</p>
    );
};
