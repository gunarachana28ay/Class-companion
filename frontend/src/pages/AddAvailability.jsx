import React, { useState, useContext } from 'react';
import useAxios from '../api/axiosConfig';
import UserContext from '../context/UserContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const staticDate = '2024-07-04';

export default function AddAvailability() {
    const axiosInstance = useAxios();
    const { userData } = useContext(UserContext);

    const [startTime, setStartTime] = useState('09:00 AM');
    const [endTime, setEndTime] = useState('05:00 PM');
    const [selectedDays, setSelectedDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleDay = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axiosInstance.post('/availability/', {
                start_time: `${staticDate}T${formatTime(startTime)}`,
                end_time: `${staticDate}T${formatTime(endTime)}`,
                days: selectedDays.join(' ')
            });
            alert('Availability updated successfully.');
        } catch (err) {
            setError('Failed to update availability. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const period = time.split(' ')[1];
        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        }
        if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        return `${hour24.toString().padStart(2, '0')}:${minute.split(' ')[0]}`;
    };

    const renderTimePicker = (time, setTime) => {
        const [hour, minute, period] = time.split(/[: ]/);
        return (
            <div className="flex items-center space-x-2 justify-center">
                <select
                    value={hour}
                    onChange={(e) => setTime(`${e.target.value}:${minute} ${period}`)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>
                    ))}
                </select>
                <span className="text-lg">:</span>
                <select
                    value={minute}
                    onChange={(e) => setTime(`${hour}:${e.target.value} ${period}`)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                    {['00', '15', '30', '45'].map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <select
                    value={period}
                    onChange={(e) => setTime(`${hour}:${minute} ${e.target.value}`)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                    {['AM', 'PM'].map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800 text-center">Set Your Availability</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">Working Hours</label>
                        <div className="flex flex-col sm:flex-row sm:space-x-6 mb-4">
                            <div className="flex flex-col w-full sm:w-1/2 mb-4 sm:mb-0">
                                <span className="text-sm font-medium text-gray-600 mb-1">Start</span>
                                {renderTimePicker(startTime, setStartTime)}
                            </div>
                            <div className="flex flex-col w-full sm:w-1/2">
                                <span className="text-sm font-medium text-gray-600 mb-1">End</span>
                                {renderTimePicker(endTime, setEndTime)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">Available Days</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-md text-white font-medium ${selectedDays.includes(day)
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    } transition duration-150 ease-in-out`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                    {error && (
                        <p className="text-red-600 text-sm text-center mt-2">{error}</p>
                    )}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} transition duration-150 ease-in-out`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
