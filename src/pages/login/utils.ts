import type { RoleCode, UserRoleCode } from "../../models/common";

export interface AuthUser {
  role?: RoleCode;
  user_role?: UserRoleCode;
  _id?: string;
  company?: string;
  email?: string;
  name?: string;
}

/**
 * Get the default route based on user role and user_role
 */
export const getDefaultRoute = (authUser: AuthUser): string => {
  if (authUser.role === "admin") {
    return "/dashboard";
  }

  // For customers, redirect to history as their main landing page
  return "/history";
};

/**
 * Check if user has access to a specific route
 */
export const hasRouteAccess = (authUser: AuthUser, route: string): boolean => {
  // Admin has access to everything
  if (authUser.role === "admin") {
    return true;
  }

  // Customer role restrictions
  if (authUser.role === "customer") {
    const allowedRoutesForUserAdmin = [
      "/history",
      "/aqi-logs",
      "/devices",
      "/templates",
      "/templates/setup",
      "/preview",
      "/customers",
    ];

    const allowedRoutesForExecutive = [
      "/history",
      "/aqi-logs",
      "/devices",
      "/templates",
      "/templates/setup",
      "/preview",
    ];

    if (authUser.user_role === "useradmin") {
      return allowedRoutesForUserAdmin.includes(route);
    }

    if (authUser.user_role === "executive") {
      return allowedRoutesForExecutive.includes(route);
    }
  }

  return false;
};

/**
 * Store auth data in localStorage
 */
export const storeAuthData = (authUser: AuthUser): void => {
  localStorage.setItem("auth", JSON.stringify(authUser));
};

/**
 * Get auth data from localStorage
 */
export const getAuthData = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Clear auth data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem("auth");
};

/**
 * Logout user and redirect to login
 */
export const logout = (navigate?: (path: string) => void): void => {
  clearAuthData();
  if (navigate) {
    navigate("/login");
  } else {
    window.location.href = "/login";
  }
};
