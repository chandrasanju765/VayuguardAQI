import { useState, useEffect } from "react";
import {
  useGetDashboardData,
  useGetAQIDevices,
  useGetCustomers,
} from "../../data/cachedQueries";

const APITestPage = () => {
  const dashboardQuery = useGetDashboardData();
  const devicesQuery = useGetAQIDevices();
  const customersQuery = useGetCustomers();

  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const results = {
      dashboard: {
        data: dashboardQuery.data,
        error: dashboardQuery.error,
        isLoading: dashboardQuery.isLoading,
        endpoint: "/api/dashboard-data",
      },
      devices: {
        data: devicesQuery.data,
        error: devicesQuery.error,
        isLoading: devicesQuery.isLoading,
        endpoint: "/api/AirQualityDevice",
      },
      customers: {
        data: customersQuery.data,
        error: customersQuery.error,
        isLoading: customersQuery.isLoading,
        endpoint: "/api/Customer",
      },
      apiBaseURL: import.meta.env.VITE_API_BASE_URL,
    };
    setTestResults(results);
  }, [
    dashboardQuery.data,
    dashboardQuery.error,
    dashboardQuery.isLoading,
    devicesQuery.data,
    devicesQuery.error,
    devicesQuery.isLoading,
    customersQuery.data,
    customersQuery.error,
    customersQuery.isLoading,
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">API Test Page</h1>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(testResults).map(([key, value]: [string, any]) => (
          <div key={key} className="p-4 border rounded bg-white">
            <h3 className="font-semibold text-lg mb-2">{key.toUpperCase()}</h3>
            {typeof value === "string" ? (
              <p className="text-sm">{value || "Not set"}</p>
            ) : (
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APITestPage;
