import { Routes, Route, Navigate } from "react-router-dom";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;