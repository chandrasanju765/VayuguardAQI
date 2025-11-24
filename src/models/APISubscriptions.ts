import type { APIResponse } from "./common";
import type { AQIDevice } from "./AQIDevices";

export interface APISubscriptionColumns {
  active: string;
  apiKey: string;
  deviceId: string;
  subscriberEmail: string;
  subscriberName: string;
  subscriptionId: string;
}

export interface APISubscription {
  _id: string;
  subscriptionId: string;
  subscriberName: string;
  subscriberEmail: string;
  deviceId: AQIDevice | string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  apiKey: string;
  __v: number;
}

// --- API Requests & Responses ---
export interface GetAPISubscriptionsResponse
  extends APIResponse<{
    data: APISubscription[];
    columns: APISubscriptionColumns;
  }> {}

export interface CreateOrUpdateAPISubscriptionRequest {
  active: boolean;
  deviceId: string;
  subscriberEmail: string;
  subscriberName: string;
  subscriptionId: string;
}

export interface CreateOrUpdateAPISubscriptionResponse
  extends APIResponse<APISubscription> {}
