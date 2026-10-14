import React, { useEffect, useState } from 'react';
import useAxios from '../api/axiosConfig';
import StarRating from '../components/star';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [topTutors, setTopTutors] = useState([]);
    const [topTutorsLoading, setTopTutorsLoading] = useState(false);
    const [topCourses, setTopCourses] = useState([]);
    const [topCoursesLoading, setTopCoursesLoading] = useState(false);
    const axiosIstance = useAxios();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setTopTutorsLoading(true);
            setTopCoursesLoading(true);
            try {
                const resTutors = await axiosIstance.get("/top_tutors");
                setTopTutors(resTutors.data.data)


                const resCourse = await axiosIstance.get("/top_courses");
                setTopCourses(resCourse.data.data)
            } catch (err) { }
            finally {
                setTopTutorsLoading(false);
                setTopCoursesLoading(false);
            }
        })()
    }, [])

    const handleTutorClick = (tutor) => {
        navigate(`/tutors/tutor_details/${tutor.id}`)
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="rounded-lg mb-6 p-6">
                <h2 className="text-2xl font-bold mb-4 text-left">Top Tutors</h2>
                <div className="w-full flex flex-wrap">

                    {
                        topTutorsLoading ?
                            Array.from({ length: 6 }).map((a, idx) => (
                                <div className='w-full lg:w-4/12 px-1 py-1' key={`${idx}`}>
                                    <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4 w-full h-full">
                                        <div role="status" class="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                            <div
                                                className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                                            >
                                                <svg class="w-10 h-10 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                                </svg>
                                            </div>
                                            <div class="w-full">
                                                <div class="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
                                                <div class="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full max-w-[460px] mb-2.5"></div>
                                                <div class="h-2 bg-gray-200 rounded-full max-w-[360px]"></div>
                                            </div>
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            topTutors.map(t => (
                                <TutorCard tutor={t} onClick={() => handleTutorClick(t)} />
                            ))
                    }
                </div>
            </div>

            <div className="rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-left">Top Courses</h2>
                <div className="w-full flex flex-wrap">
                    {
                        topCoursesLoading ?
                            Array.from({ length: 6 }).map((a, idx) => (
                                <div className='w-full lg:w-4/12 px-1 py-1' key={`${idx}`}>
                                    <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4 w-full h-full">
                                        <div role="status" class="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                            <div class="w-full">
                                                <div class="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
                                            </div>
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            )) :
                            topCourses.map(c => (
                                <CourseCard course={c} />
                            ))
                    }
                </div>
            </div>
        </div>
    );
};

const TutorCard = ({ tutor, onClick }) => {
    return (
        <div className='w-full lg:w-4/12 px-1 py-1'>
            <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4 w-full h-full cursor-pointer" onClick={onClick}>
                <img
                    src={tutor.profile_picture}
                    alt={`${tutor.first_name}'s profile`}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-left">{tutor.firstname + " " + tutor.lastname}</h2>
                    <hr className={`border-t border-gray-200`} />
                    {
                        tutor?.bio &&
                        <p className="text-left text-gray-600">{tutor.bio.length > 100 ? `${tutor.bio.slice(0, 100)}...` : tutor.bio}</p>
                    }
                    <div className='w-full flex justify-end'>
                        {
                            tutor.rating ?
                                <StarRating rating={tutor.rating} /> : <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseCard = ({ course }) => {
    return (
        <div className='w-full lg:w-4/12 px-1 py-1'>
            <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4 w-full h-full">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-left">{course.name}</h2>
                </div>
            </div>
        </div>
    );
};
