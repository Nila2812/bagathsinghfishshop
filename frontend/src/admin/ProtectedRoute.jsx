import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  // If not logged in, go to /admin (login page)
  return isLoggedIn ? children : <Navigate to="/admin" replace />;
};

export default ProtectedRoute;
