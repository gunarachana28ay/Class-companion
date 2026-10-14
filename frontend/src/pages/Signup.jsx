import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import FileSelector from '../components/FileSelector';
import ButtonSpinner from '../components/ButtonSpinner';

const UserTypes = {
    TUTOR: "tutor",
    STUDENT: "student"
}

const studentUserValidationRules = {
    requiredFields: ["username", "firstname", "lastname", "email", "password"]
}

const tutorUserValidationRules = {
    requiredFields: ["username", "firstname", "lastname", "email", "password", "cv", "profile_picture", "subject", "bio"]
}

const validateInput = (validationRule, data) => {
    const errObj = {};

    // validating required fileds
    for (let field of validationRule.requiredFields) {
        if (!data[field]) {
            errObj[field] = `required!`
        }
    }

    // validate confirm password
    if (data["password"] !== data["confirmPassword"]) {
        errObj["confirmPassword"] = `Password and Confirm Password do not match!`

    }

    // validating email (show invalid email error if there isn't already an email related validation error)
    if (!errObj["email"] && !data.email?.endsWith("@hs-fulda.de")) {
        errObj["email"] = "Please use Hochschule Fulda email!"
    }

    // validating experience (show invalid email error if there isn't already an email related validation error)
    if (data["experience"] <= 0) {
        errObj["experience"] = "Experience must be greater than 0!"
    }

    const passed = Object.keys(errObj).length === 0;

    return { passed, errObj }
}

export const SignupForm = () => {
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bio, setBio] = useState('');
    const [subject, setSubject] = useState('');
    const [experience, setExperience] = useState(0);
    const [userType, setUserType] = useState(UserTypes.STUDENT);
    const [selectedProfilePicFile, setSelectedProfilePicFile] = useState(null);
    const [profilePicPreviewSource, setProfilePicPreviewSource] = useState("");
    const [selectedCVFile, setSelectedCVFile] = useState(null);
    const [signupInProgress, setSignupInProgress] = useState(false);
    const [errObj, setErrObj] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedProfilePicFile) return;
        const reader = new FileReader();
        reader.readAsDataURL(selectedProfilePicFile);
        reader.onloadend = () => {
            setProfilePicPreviewSource(reader.result);
        };
    }, [selectedProfilePicFile])

    const studentUserTypePayload = useMemo(() => ({
        username,
        firstname,
        lastname,
        email,
        password,
        user_type: UserTypes.STUDENT,
        profile_picture: selectedProfilePicFile
    }), [username, firstname, lastname, password, email, selectedProfilePicFile])

    const tutorUserTypePayload = useMemo(() => ({
        username,
        firstname,
        lastname,
        email,
        password,
        subject,
        user_type: UserTypes.TUTOR,
        profile_picture: selectedProfilePicFile,
        cv: selectedCVFile,
        bio,
        experience
    }), [username, firstname, lastname, password, email, selectedProfilePicFile, selectedCVFile, bio, subject])

    useEffect(() => {
        setErrObj({})
    }, [userType])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        let payloadObj;
        let validationRule;
        if (userType == UserTypes.STUDENT) {
            payloadObj = studentUserTypePayload;
            validationRule = studentUserValidationRules;
        } else {
            payloadObj = tutorUserTypePayload;
            validationRule = tutorUserValidationRules;
        }

        const validationResult = validateInput(validationRule, { ...payloadObj, confirmPassword })

        console.log(validationResult)
        if (!validationResult.passed) {
            return setErrObj(validationResult.errObj)
        } else {
            setErrObj({});
        }

        for (let key of Object.keys(payloadObj)) {
            formData.append(key, payloadObj[key])
        }

        setSignupInProgress(true);
        try {
            const response = await axios.post(process.env.REACT_APP_API_URL + '/signup/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Signup successful!');
            navigate("/login")
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
            toast.error('Signup failed: ' + errorMessage);
            console.error('Signup failed:', errorMessage);
        } finally {
            setSignupInProgress(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <img src={selectedProfilePicFile} alt="" />
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    className="mx-auto h-10 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Your Company"
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign up for a new account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" action="#" onSubmit={handleSubmit}>
                    <div className='flex w-full gap-2'>
                        <div className="flex items-center ps-4 border border-gray-200 rounded w-full" onClick={() => setUserType(UserTypes.STUDENT)}>
                            <input id="bordered-radio-1" type="radio" value="" checked={userType === UserTypes.STUDENT} onChange={() => { }} name="bordered-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                            <label htmlFor="bordered-radio-1" className="w-full py-4 ms-2 text-sm font-medium text-gray-900">Student</label>
                        </div>
                        <div className="flex items-center ps-4 border border-gray-200 rounded w-full" onClick={() => setUserType(UserTypes.TUTOR)}>
                            <input id="bordered-radio-2" type="radio" value="" checked={userType === UserTypes.TUTOR} onChange={() => { }} name="bordered-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                            <label htmlFor="bordered-radio-2" className="w-full py-4 ms-2 text-sm font-medium text-gray-900">Tutor</label>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Profile Picture
                            </label>
                        </div>
                        <div className="mt-2">
                            <FileSelector supportedTypes={["png", "jpg", "jpeg"]} onFileChange={(file) => { setSelectedProfilePicFile(file) }} previewUrl={profilePicPreviewSource} />
                            {
                                errObj.profile_picture &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.profile_picture}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Username
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="username"
                                name="username"
                                type="username"
                                autoComplete="current-username"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            {
                                errObj.username &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.username}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="firstname" className="block text-sm font-medium leading-6 text-gray-900">
                                First Name
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="firstname"
                                name="firstname"
                                type="firstname"
                                autoComplete="current-firstname"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />

                            {
                                errObj.firstname &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.firstname}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="lastname" className="block text-sm font-medium leading-6 text-gray-900">
                                Last Name
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="lastname"
                                name="lastname"
                                type="lastname"
                                autoComplete="current-lastname"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />

                            {
                                errObj.lastname &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.lastname}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="current-email"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {
                                errObj.email &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.email}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {
                                errObj.password &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.password}
                                </span>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Confirm Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            {
                                errObj.confirmPassword &&
                                <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                    {errObj.confirmPassword}
                                </span>
                            }
                        </div>
                    </div>
                    {
                        userType == UserTypes.TUTOR &&
                        <>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
                                        Subject
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="subject"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="" />
                                    {
                                        errObj.subject &&
                                        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                            {errObj.subject}
                                        </span>
                                    }
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="experience" className="block text-sm font-medium leading-6 text-gray-900">
                                        Experience
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="experience"
                                        type="number"
                                        value={experience}
                                        onChange={e => setExperience(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="" />
                                    {
                                        errObj.experience &&
                                        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                            {errObj.experience}
                                        </span>
                                    }
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">
                                        Bio
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <textarea
                                        id="bio"
                                        rows="4"
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Write your quick intro..." />
                                    {
                                        errObj.bio &&
                                        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                            {errObj.bio}
                                        </span>
                                    }
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                        CV
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <FileSelector supportedTypes={["pdf"]} onFileChange={(file) => { setSelectedCVFile(file) }} selectedFileName={selectedCVFile?.name} />
                                    {
                                        errObj.cv &&
                                        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1 absolute">
                                            {errObj.cv}
                                        </span>
                                    }
                                </div>
                            </div>
                        </>
                    }

                    <div>
                        <button
                            type="submit"
                            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${signupInProgress ? "opacity-60 cursor-not-allowed" : ""}`}
                            disabled={signupInProgress}
                        >
                            <p className='flex justify-center align-center relative'>
                                {
                                    signupInProgress &&
                                    <ButtonSpinner />
                                }
                                Sign up
                            </p>
                        </button>
                    </div>
                </form>
                <p className="mt-10 text-center text-sm text-gray-500">
                    Already a member?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

