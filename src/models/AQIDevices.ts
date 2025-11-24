import type { APIResponse, SubscriptionType, User } from "./common";

export type AQIDeviceStatus = "active" | "inactive" | "maintenance";

export interface AQIDevice {
  _id: string;
  deviceId: string;
  name: string;
  locationName: string;
  status: AQIDeviceStatus;
  outdoorAPIState: string | null;
  outdoorAPICity: string | null;
  outdoorAPIStation: string | null;
  subscriptionType: SubscriptionType;
  subsciptionExpiryDate: string | null;
  assignedUserId: User;
  customerId: string;
  editableByCustomer: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AQIDeviceColumns {
  deviceId: string;
  name: string;
  locationName: string;
  status: string;
  customerId: string;
  assignedUserId: string;
  subscriptionType: string;
  subsciptionExpiryDate: string;
  editableByCustomer: boolean;
}

// --- API Request & Responses ---
export interface GetAQIDevicesResponse
  extends APIResponse<{
    data: AQIDevice[];
    columns: AQIDeviceColumns;
  }> {}

export interface CreateOrUpdateAQIDeviceRequest {
  assignedUserId: string | null;
  customerId: string;
  deviceId: string;
  editableByCustomer: boolean;
  locationName: string;
  name: string;
  outdoorAPICity: string | null;
  outdoorAPIStation: string | null;
  outdoorAPIState?: string | null;
  status: AQIDeviceStatus;
  subsciptionExpiryDate: string | null;
  subscriptionType: SubscriptionType;
}

export interface CreateOrUpdateAQIDeviceResponse
  extends APIResponse<AQIDevice> {}
