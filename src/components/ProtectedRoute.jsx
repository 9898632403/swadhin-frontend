import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo } = useContext(UserContext);
  const location = useLocation();

  const userEmail = userInfo?.email || userInfo?.user?.email || "";

  console.log("ProtectedRoute - userInfo:", userInfo);
  console.log("userEmail:", userEmail);

  if (!userEmail) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (adminOnly && userEmail !== "admin@example.com") {
    return <p>❌ Access denied. Admins only.</p>;
  }

  return children;
};


export default ProtectedRoute;
