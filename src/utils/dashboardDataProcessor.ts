import type { AQIDevice } from "../models/AQIDevices";
import type { DashboardData } from "../models/Dashboard";

export function processDeviceDataToDashboardStats(
  devices: AQIDevice[]
): DashboardData {
  // Group devices by customer
  const devicesByCustomers = devices.reduce((acc, device) => {
    const customerId = device.customerId;
    const customerName = device.assignedUserId?.name || "";

    const existing = acc.find((item) => item.customerId === customerId);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        _id: customerId,
        customerId,
        customerName: customerName || undefined,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ _id: string; customerId: string; customerName?: string; count: number }>);

  // Group devices by location
  const devicesByLocations = devices.reduce((acc, device) => {
    const location = device.locationName;
    const existing = acc.find((item) => item._id === location);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        _id: location,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ _id: string; count: number }>);

  // Get unique customers
  const uniqueCustomers = [
    ...new Set(devices.map((device) => device.customerId)),
  ];

  // Create mock time-based data (you can adjust this logic based on your needs)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  // For devicesOnboarded, we'll group by month (mock data - in reality this should come from createdAt dates)
  const devicesOnboarded = [
    { _id: currentMonth - 2, count: Math.floor(devices.length * 0.3) },
    { _id: currentMonth - 1, count: Math.floor(devices.length * 0.4) },
    { _id: currentMonth, count: Math.floor(devices.length * 0.3) },
  ].filter((item) => item.count > 0);

  // For customersOnboarded, similar logic
  const customersOnboarded = [
    { _id: currentMonth - 2, count: Math.floor(uniqueCustomers.length * 0.4) },
    { _id: currentMonth - 1, count: Math.floor(uniqueCustomers.length * 0.3) },
    { _id: currentMonth, count: Math.floor(uniqueCustomers.length * 0.3) },
  ].filter((item) => item.count > 0);

  return {
    devicesOnboarded,
    devicesByCustomers,
    devicesByLocations,
    customersOnboarded,
    activities: {
      devices: [],
      customers: [],
      subscriptions: [],
      dashboards: [],
    },
  };
}
