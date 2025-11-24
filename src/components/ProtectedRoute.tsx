import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getAuthData,
  hasRouteAccess,
  getDefaultRoute,
} from "../pages/login/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const authData = getAuthData();

  if (!authData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRouteAccess(authData, location.pathname)) {
    const defaultRoute = getDefaultRoute(authData);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
