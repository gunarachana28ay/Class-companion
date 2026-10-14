import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../context/UserContext";
import NotificationContext from "../context/Notification";

const NavBar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { notificationCount } = useContext(NotificationContext);

  let [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAppointmentClick = () => {
    navigate(`/appointments-list`);
  };

  const handleChatClick = () => {
    navigate(`/chat`);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(prev => (term?.length > 40 ? prev : term));
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    if (searchTerm.trim() === "") {
      navigate(`/tutors`);
    } else {
      navigate(`/tutors/?query=${searchTerm}`);
    }
  };
  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const handleSignout = () => {
    logout();
    navigate(`/login`)
  }

  return (
    <nav className="bg-white">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button onClick={() => { navigate("/") }} type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>

              <img
                src={"/logo.jpg"}
                className="w-15 cursor-pointer md:ml-[-35]"
                style={{ borderRadius: "50%", height: "35px", marginLeft: "-7px" }}
                alt="Logo"
              />

              <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center cursor-pointer" onClick={() => { navigate("/") }}>
              <img className="h-8 w-auto" src="/logo.jpg" alt="Your Company" />
            </div>
            <form
              onSubmit={handleSearchClick}
              className="flex  ml-4 border-2 border-gray-300 rounded-full w-full md:w-auto "
              style={{ maxWidth: "900px" }}
            >
              <input
                type="text"
                placeholder="Search..."
                className="flex-grow outline-none px-4 py-2 text-sm md:text-base"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  border: "none",
                  width: "100%",
                  maxWidth: "900px",
                }}
              />
              <button
                type="submit"
                className="ml-2 bg-indigo-600 hover:bg-indigo-500 shadow-sm text-white rounded-full text-sm md:text-base" // Adjust text size as needed
                style={{ minWidth: "60px" }} // Inline style for rounded corner
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-white-600"
                />
              </button>
            </form>
          </div>
          <div className="inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <button
                  onClick={handleAppointmentClick}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Appointments
                </button>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <button
                  onClick={handleChatClick}
                  className="relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {
                    notificationCount > 0 &&
                    <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">{notificationCount}</div>
                  }
                  Chats
                </button>
              </div>
            </div>

            <div className="relative ml-3">
              <div>
                <button type="button"
                  className="relative flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 h-8"
                  id="user-menu-button" aria-expanded="false" aria-haspopup="true" onClick={() => { setIsDropdownVisible(prev => !prev) }}>
                  <span className="absolute-inset-1.5"></span>
                  <span className="sr-only">Open user menu</span>
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="text-white-600 h-full"
                  />

                  {/* Dropdown with link to profile page and logout button */}
                  <div className={`absolute top-full right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-start ${isDropdownVisible ? "" : "hidden"}`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                    <div className="py-1" role="none">
                      <a href="" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-0" onClick={handleProfileClick}>Profile</a>
                      <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-3" onClick={handleSignout}>Sign out</button>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="sm:hidden" id="mobile-menu">
        <div className="flex space-x-2 px-2 pb-3 pt-2">
          <button
            onClick={handleAppointmentClick}
            className="flex-1 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Appointments
          </button>
          <button
            onClick={handleChatClick}
            className="relative flex-1 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {
              notificationCount > 0 &&
              <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">{notificationCount}</div>
            }
            Chats
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
