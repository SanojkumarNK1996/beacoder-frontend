import { Routes, Route, Navigate } from "react-router-dom";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate homepage based on their actual role
    if (userRole === "instructor") {
      return <Navigate to="/instructor/assignments" replace />;
    } else {
      return <Navigate to="/homepage" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;