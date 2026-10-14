import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import ButtonSpinner from '../components/ButtonSpinner';

export const LoginForm = () => {
    const { login } = useContext(UserContext); // Extract necessary values from context
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errObj, setErrObj] = useState({});
    const [signinInProgress, setSigninInProgress] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username && password) {
            setErrObj({});

            setSigninInProgress(true);
            const result = await login(username, password);
            setSigninInProgress(false);

            if (result.success) {
                toast.success('Login successful!');

                navigate('/');
            } else {
                toast.error('Login failed: ' + result.error);
                console.error('Login failed:', result.error);
            }
        } else {
            const err = {}
            if (!username) err.username = "Username is required!";
            if (!password) err.password = "Password is required!";
            setErrObj(err);
        }
    };

    return (
        <>
            {/*
            This example requires updating your template:
    
            ```
            <html className="h-full bg-white">
            <body className="h-full">
            ```
          */}
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-10 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                        alt="Your Company"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" onSubmit={handleSubmit}>
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
                            <button
                                type="submit"
                                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${signinInProgress ? "opacity-60 cursor-not-allowed" : ""}`}
                                disabled={signinInProgress}
                            >

                                <p className='flex justify-center align-center relative'>
                                    {
                                        signinInProgress &&
                                        <ButtonSpinner />
                                    }
                                    Sign in
                                </p>
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <Link to="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
};