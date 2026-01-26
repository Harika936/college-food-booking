import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedOwnerRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in or not outlet owner → go to login
  if (!user || user.role !== "outlet_owner") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedOwnerRoute;
