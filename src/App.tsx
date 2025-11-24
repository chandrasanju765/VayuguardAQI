import { Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "jotai";
import { Toaster } from "react-hot-toast";
import LeftNavbar from "./components/shared/LeftNavbar";
import TopNavbar from "./components/shared/TopNavbar/TopNavbar";
import Devices from "./pages/devices";
import History from "./pages/history";
import AQILogs from "./pages/aqi-logs";
import LoginPage from "./pages/login";
import Customers from "./pages/customers";
import APISubscriptions from "./pages/api-subscriptions";
import ProtectedRoute from "./components/ProtectedRoute";
import { getAuthData } from "./pages/login/utils";
import TemplatesPage from "./pages/templates";
import SetupTemplatePage from "./pages/templates/setup";
import PreviewPage from "./pages/templates/preview";
import DashboardPage from "./pages/dashboard";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const authData = getAuthData();
  const isAuthenticated = !!authData;

  return (
    <Provider>
      <div className="bg-white w-full">
        <div className="flex w-full h-screen">
          {!isLoginPage && isAuthenticated && <LeftNavbar />}
          <main className="flex-1 flex flex-col overflow-hidden">
            {!isLoginPage && isAuthenticated && <TopNavbar />}
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aqi-logs"
                  element={
                    <ProtectedRoute>
                      <AQILogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/devices"
                  element={
                    <ProtectedRoute>
                      <Devices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute>
                      <TemplatesPage />
                    </ProtectedRoute>
                  }
                >
                  <Route path="setup" element={<SetupTemplatePage />} />
                </Route>
                <Route
                  path="/preview"
                  element={
                    <ProtectedRoute>
                      <PreviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/api-subscriptions"
                  element={
                    <ProtectedRoute>
                      <APISubscriptions />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
        }}
      />
    </Provider>
  );
}

export default App;
