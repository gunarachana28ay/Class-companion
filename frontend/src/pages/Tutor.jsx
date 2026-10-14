import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { tutors } from "../constant/data";
import StarRating from "../components/star";

import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const InputField = styled.div`
  flex: 1;
  min-width: 150px;
  margin-right: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 12px 20px;
  margin-top: 1rem;
  border-radius: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Tutor = () => {
  const query = useQuery();
  const queryTerm = query.get("query"); // This will extract the 'query' parameter from the URL

  const [show, setShow] = useState(false);
  //   const [searchTerm, setSearchTerm] = useState(queryTerm || "");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [rating, setRating] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [displayMinExpDropdown, setDisplayMinExpDropdown] = useState(false);
  const [displayMaxExpDropdown, setDisplayMaxExpDropdown] = useState(false);
  const [displayRatingDropdown, setDisplayRatingDropdown] = useState(false);

  const navigate = useNavigate();

  const resetFilters = () => {
    setShow(true);
    setMinExperience("");
    setMaxExperience("");
    setRating("");
    setFilteredData([]);
    setError("");
  };

  useEffect(() => {
    resetFilters();
    fetchItems();
  }, [queryTerm])

  const handleFilter = async () => {
    let minExp = parseFloat(minExperience);
    let maxExp = parseFloat(maxExperience);
    let ratingVal = parseFloat(rating);


    if (isNaN(minExp)) minExp = 0;
    if (isNaN(maxExp)) maxExp = 0;
    if (isNaN(ratingVal)) ratingVal = 0;

    try {
      if (queryTerm == null) {
        const response = await axios.get(
          process.env.REACT_APP_API_URL +
          `/search?experience_min=${minExp}&experience_max=${maxExp}&rating=${ratingVal}`
          // `http://localhost:8000/search?keyword=${searchTerm}`
          //  `http://localhost:8000/search?keyword=${queryTerm}&experience_min=${minExp}&experience_max=${maxExp}&rating=${ratingVal}`
        );
        console.log(response.data.tutors, "filtered");
        setFilteredData(response.data.tutors);
      } else {
        const response = await axios.get(
          process.env.REACT_APP_API_URL +
          `/search?keyword=${queryTerm}&experience_min=${minExp}&experience_max=${maxExp}&rating=${ratingVal}`
          // `http://localhost:8000/search?keyword=${searchTerm}`
          //  `http://localhost:8000/search?keyword=${queryTerm}&experience_min=${minExp}&experience_max=${maxExp}&rating=${ratingVal}`
        );
        console.log(response.data.tutors, "filtered");
        setFilteredData(response.data.tutors);
      }

      //  setItems(response.data.tutors);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        setError(new Error("Server error. Please try again later."));
      } else {
        setError(error);
      }
    }
    setLoading(false);
    setShow(false);
    // console.log("min:" + minExp, "max: " + maxExp, "rat:" + ratingVal);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    if (queryTerm === "") {
      setFilteredData([]);
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors
    console.log(queryTerm, "ccc");
    try {
      if (queryTerm == null) {
        let response = await axios.get(
          process.env.REACT_APP_API_URL + `/search?`
          // `http://localhost:8000/search?keyword=${queryTerm}`
        );
        console.log(response.data.tutors, "data");
        setFilteredData(response.data.tutors);
      } else {
        let response = await axios.get(
          process.env.REACT_APP_API_URL + `/search?keyword=${queryTerm}`
          // `http://localhost:8000/search?keyword=${queryTerm}`
        );
        console.log(response.data.tutors, "data");
        setFilteredData(response.data.tutors);
      }
    } catch (error) {
      setError(error);
    }
    setLoading(false);
    setShow(false);
  };

  return (
    <div>
      <div className="">
        <div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-end border-b border-gray-200 pb-6 pt-2 lg:pt-24">
              <div className="flex lg:items-end gap-4 flex-col lg:flex-row w-full lg:w-auto">
                <div className="text-start">
                  <label id="listbox-label" className="block text-sm font-medium leading-6 text-gray-900">Min Experience</label>
                  <div className="relative mt-2">
                    <button type="button" className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" onClick={() => {
                      setDisplayMinExpDropdown(prev => !prev)
                    }}>
                      <span className="flex items-center">
                        <span className="ml-3 block truncate">{minExperience || "Select"}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>

                    <ul className={`absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${displayMinExpDropdown ? "" : "hidden"}`} tabIndex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                      {[...Array(11).keys()].map((i) => (
                        <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900" id="listbox-option-0" role="option" onClick={() => {
                          setMinExperience(i);
                          setDisplayMinExpDropdown(false);
                        }}>
                          <div className="flex items-center">
                            <span className="ml-3 block truncate font-normal">{i} years</span>
                          </div>

                          {
                            minExperience == i &&
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            </span>
                          }
                        </li>
                      ))}

                    </ul>
                  </div>
                </div>

                <div className="text-start">
                  <label id="listbox-label" className="block text-sm font-medium leading-6 text-gray-900">Max Experience</label>
                  <div className="relative mt-2">
                    <button type="button" className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" onClick={() => {
                      setDisplayMaxExpDropdown(prev => !prev)
                    }}>
                      <span className="flex items-center">
                        <span className="ml-3 block truncate">{maxExperience || "Select"}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>

                    <ul className={`absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${displayMaxExpDropdown ? "" : "hidden"}`} tabIndex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                      {[...Array(11).keys()].map((i) => (
                        <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900" id="listbox-option-0" role="option" onClick={() => {
                          setMaxExperience(i);
                          setDisplayMaxExpDropdown(false);
                        }}>
                          <div className="flex items-center">
                            <span className="ml-3 block truncate font-normal">{i} years</span>
                          </div>

                          {
                            minExperience == i &&
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            </span>
                          }
                        </li>
                      ))}

                    </ul>
                  </div>
                </div>

                <div className="text-start">
                  <label id="listbox-label" className="block text-sm font-medium leading-6 text-gray-900">Rating</label>
                  <div className="relative mt-2">
                    <button type="button" className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label" onClick={() => {
                      setDisplayRatingDropdown(prev => !prev)
                    }}>
                      <span className="flex items-center">
                        <span className="ml-3 block truncate">{rating || "Select"}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>

                    <ul className={`absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${displayRatingDropdown ? "" : "hidden"}`} tabIndex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                      {[...Array(10).keys()].map((i) => (
                        <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900" id="listbox-option-0" role="option" onClick={() => {
                          setRating((i + 1) / 2);
                          setDisplayRatingDropdown(false);
                        }}>
                          <div className="flex items-center">
                            <span className="ml-3 block truncate font-normal">{(i + 1) / 2}</span>
                          </div>

                          {
                            minExperience == i &&
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            </span>
                          }
                        </li>
                      ))}

                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleFilter}
                    className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                  >
                    Filter
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div id="results" className="results"></div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}

          {!show && filteredData.length === 0 && (
            <p>No tutors found. Please adjust your filters and try again.</p>
          )}

          {!show && filteredData.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {
                filteredData.map((item, index) => (
                  <li className={`pb-3 sm:pb-4 hover:bg-slate-200 p-2 rounded-lg cursor-pointer`} key={`${index}`} onClick={() => { navigate(`/tutors/tutor_details/${item.id}`) }}>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                        <img className="h-full w-full object-cover" src={item.profile_picture || "/profile.jpg"} alt="Neil image" />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.firstname + " " + item.lastname}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {item.email}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-base font-semibold text-gray-900">
                        <StarRating rating={item.rating} />
                      </div>
                    </div>
                  </li>
                ))
              }
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
export default Tutor;
