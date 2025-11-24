import StatCard from "./StatCard";
import DataListCard from "./DataListCard";
import { SimpleBarChart, SimplePieChart } from "./ChartComponents";
import { RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { useGetDashboardData } from "../../data/cachedQueries";
import { DashboardSkeleton } from "./LoadingSkeleton";

const DashboardPage = () => {
  const {
    data: actualData,
    isLoading,
    error,
    mutate,
    isValidating,
  } = useGetDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalDevices =
    actualData?.devicesOnboarded?.reduce((sum, item) => sum + item.count, 0) ||
    0;

  const totalCustomers =
    actualData?.customersOnboarded?.reduce(
      (sum, item) => sum + item.count,
      0
    ) || 0;

  // Format data for DataListCard components
  const customerDevicesData =
    actualData?.devicesByCustomers?.map((item) => ({
      label: item.customerName || item.customerId,
      value: item.count,
      subtitle: item.customerName ? item.customerId : undefined,
    })) || [];

  const locationDevicesData =
    actualData?.devicesByLocations?.map((item) => ({
      label: item._id,
      value: item.count,
    })) || [];

  // Format data for charts
  const customerChartData =
    actualData?.devicesByCustomers?.map((item) => ({
      name: item.customerName || item.customerId,
      value: item.count,
    })) || [];

  const locationChartData =
    actualData?.devicesByLocations?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  // Format data for pie chart (top customers)
  const topCustomersData =
    actualData?.devicesByCustomers
      ?.sort((a, b) => b.count - a.count)
      ?.slice(0, 5)
      ?.map((item) => ({
        name: item.customerName || item.customerId,
        value: item.count,
      })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isValidating}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                isRefreshing || isValidating ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Devices"
          value={totalDevices}
          subtitle="Devices onboarded"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtitle="Customers registered"
        />
        <StatCard
          title="Active Locations"
          value={actualData?.devicesByLocations?.length || 0}
          subtitle="Unique locations"
        />
        <StatCard
          title="Customer Coverage"
          value={actualData?.devicesByCustomers?.length || 0}
          subtitle="Customers with devices"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Devices by Customer"
          data={customerChartData}
          color="#3B82F6"
        />
        <SimplePieChart title="Top 5 Customers" data={topCustomersData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Devices by Location"
          data={locationChartData}
          color="#10B981"
        />
        <div className="grid grid-cols-1 gap-6">
          <DataListCard
            title="Recent Device Distribution"
            data={customerDevicesData.slice(0, 6)}
          />
        </div>
      </div>

      {/* Data Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataListCard title="All Customers" data={customerDevicesData} />
        <DataListCard title="All Locations" data={locationDevicesData} />
      </div>
    </div>
  );
};

export default DashboardPage;
