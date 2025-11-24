import type { APIResponse } from "./common";
import type { AQIDevice } from "./AQIDevices";
import type { User } from "./common";
import type { APISubscription } from "./APISubscriptions";
import type { Template } from "./Templates";

export interface DeviceOnboardedData {
  _id: number;
  count: number;
}

export interface DeviceByCustomerData {
  _id: string;
  count: number;
  customerId: string;
  customerName?: string;
}

export interface DeviceByLocationData {
  _id: string;
  count: number;
}

export interface CustomerOnboardedData {
  _id: number;
  count: number;
}

export interface DashboardActivities {
  devices: AQIDevice[];
  customers: User[];
  subscriptions: APISubscription[];
  dashboards: Template[];
}

export interface DashboardData {
  devicesOnboarded: DeviceOnboardedData[];
  devicesByCustomers: DeviceByCustomerData[];
  devicesByLocations: DeviceByLocationData[];
  customersOnboarded: CustomerOnboardedData[];
  activities: DashboardActivities;
}

export interface GetDashboardDataResponse extends APIResponse<DashboardData> {}
