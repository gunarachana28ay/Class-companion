import React, { useContext } from "react";
import {Navigate, useLocation} from "react-router-dom"
import UserContext from "./context/UserContext";

const ProtectedRoute = ({children}) => {
    const { authTokens } = useContext(UserContext);
    const location = useLocation();

    if(!authTokens) {
        return <Navigate to="/login" state={{ from: location}} replace />
    }

    return children
};

export default ProtectedRoute;