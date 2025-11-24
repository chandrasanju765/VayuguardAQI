import React from "react";
import { useAQIDataForSelectedDevice } from "../../hooks/useAQIDataForSelectedDevice";

/**
 * Example component showing different ways to use the AQI data hook
 */
const AQIDataExample: React.FC = () => {
  // Example 1: Get yesterday to today data (default)
  const todayData = useAQIDataForSelectedDevice();

  // Example 2: Get last 7 days data
  const weekData = useAQIDataForSelectedDevice({ daysBack: 7 });

  // Example 3: Get custom date range data
  const customData = useAQIDataForSelectedDevice({
    startDate: "2025-08-20",
    endDate: "2025-08-25",
  });

  if (!todayData.hasDeviceSelected) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium text-yellow-800">No Device Selected</h3>
        <p className="text-sm text-yellow-600 mt-1">
          Please select a device from the dropdown to view AQI data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">
        AQI Data for Device: {todayData.selectedDevice?.deviceId}
      </h2>

      {/* Today Data */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">
          Today's Data ({todayData.startDate} to {todayData.endDate})
        </h3>
        {todayData.isLoading ? (
          <p className="text-gray-600">Loading today's data...</p>
        ) : todayData.error ? (
          <p className="text-red-600">
            Error loading today's data: {todayData.error.message}
          </p>
        ) : todayData.data ? (
          <div>
            <p className="text-green-600">✅ Data loaded successfully</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(todayData.data, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-600">No data available for today</p>
        )}
      </div>

      {/* Week Data */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">
          Last 7 Days Data ({weekData.startDate} to {weekData.endDate})
        </h3>
        {weekData.isLoading ? (
          <p className="text-gray-600">Loading week data...</p>
        ) : weekData.error ? (
          <p className="text-red-600">
            Error loading week data: {weekData.error.message}
          </p>
        ) : weekData.data ? (
          <div>
            <p className="text-green-600">✅ Week data loaded successfully</p>
            <p className="text-sm text-gray-600 mt-1">
              Data keys: {Object.keys(weekData.data).join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No week data available</p>
        )}
      </div>

      {/* Custom Range Data */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">
          Custom Range Data ({customData.startDate} to {customData.endDate})
        </h3>
        {customData.isLoading ? (
          <p className="text-gray-600">Loading custom range data...</p>
        ) : customData.error ? (
          <p className="text-red-600">
            Error loading custom data: {customData.error.message}
          </p>
        ) : customData.data ? (
          <div>
            <p className="text-green-600">✅ Custom data loaded successfully</p>
            <p className="text-sm text-gray-600 mt-1">
              Data keys: {Object.keys(customData.data).join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No custom range data available</p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex gap-2">
        <button
          onClick={() => todayData.mutate()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Today's Data
        </button>
        <button
          onClick={() => weekData.mutate()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh Week Data
        </button>
      </div>
    </div>
  );
};

export default AQIDataExample;
