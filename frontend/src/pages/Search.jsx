import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    if (searchTerm == "") {
      navigate(`/tutors`);
    }
    if (searchTerm.trim()) {
      navigate(`/tutors/?query=${searchTerm}`);
    }
  };
  return (
    <div>
      <div className="">
        <h1>Search API Example</h1>
        <form id="searchForm" onSubmit={handleSearchClick}>
          <input
            type="text"
            id="searchInput"
            placeholder="Enter search term..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <input type="submit" value="Search" />
        </form>
      </div>
    </div>
  );
};
export default Search;
