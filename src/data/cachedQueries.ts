// src/data/cachedQueries.ts
import useSWR from "swr";
import customAxios, { aqicnAxios } from "./config";
import type { GetAQIDevicesResponse } from "../models/AQIDevices";
import type { GetCustomersApiResponse } from "../models/Customers";
import type { GetAPISubscriptionsResponse } from "../models/APISubscriptions";
import type { GetAQILogsByRoleResponse } from "../models/AQILogs";
import type { GetAQILogsHistoryByDeviceIDResponse } from "../models/AQILogsHistory";
import type {
  GetTemplatesResponse,
  CreateOrUpdateTemplateResponse,
} from "../models/Templates";
import type { GetDashboardDataResponse } from "../models/Dashboard";
import type { DashboardData } from "../models/Dashboard";
import type { AQICNGeoFeedResponse } from "../types/aqicn";
import { getCurrentUser } from "../utils";

async function getFetcher(url: string) {
  const response = await customAxios.get(url);
  return response.data;
}

// ❌ REMOVED (OLD API) — DO NOT USE THIS ANYMORE
// useGetRealtimeAQIData()
// -----------------------------------------------------

export function useGetAQIDevices() {
  const currentUser = getCurrentUser();
  const cacheKey = "/api/AirQualityDevice";

  const fetcher = async (url: string) => {
    if (currentUser?.user_role === "useradmin") {
      url += `?customerId=${currentUser?.company}`;
    } else if (currentUser?.user_role === "executive") {
      url += `?assignedUserId=${currentUser?._id}`;
    }
    const response = await customAxios.get(url);
    return response.data;
  };

  const { data, error, isValidating, mutate } = useSWR<GetAQIDevicesResponse>(
    cacheKey,
    fetcher
  );

  return {
    data: data?.data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useGetCustomers() {
  const currentUser = getCurrentUser();
  const cacheKey = "/api/Customer";

  const fetcher = async (url: string) => {
    if (currentUser?.role !== "admin") {
      url += `?company=${currentUser?.company}`;
    }
    const response = await customAxios.get(url);
    return response.data;
  };

  const { data, error, isValidating, mutate } = useSWR<GetCustomersApiResponse>(
    cacheKey,
    fetcher
  );

  return {
    data: data?.data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useGetAQILogsByRole(role: string) {
  const cacheKey = role ? `/aqi-logs-filtered/${role}` : null;
  const { data, error, isValidating, mutate } =
    useSWR<GetAQILogsByRoleResponse>(cacheKey, getFetcher);

  return {
    data: data?.data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

// ❌ HISTORY FUNCTION STILL USING OLD API — KEEP IT AS IS FOR NOW
// (YOU SAID we only fix Frame 1 for now)

export function useGetAQILogsHistoryByDeviceID({
  deviceId,
  startDate,
  endDate,
}: {
  deviceId: string | null | undefined;
  startDate: string;
  endDate: string;
}) {
  const cacheKey = deviceId
    ? `/aqi-logs-all-id/${startDate}/${endDate}/${deviceId}`
    : null;

  const { data, error, isValidating, mutate } =
    useSWR<GetAQILogsHistoryByDeviceIDResponse>(cacheKey, getFetcher);

  return {
    data: data?.data,
    error,
    isLoading: cacheKey ? !error && !data : false,
    isValidating,
    mutate,
  };
}

export function useGetAPISubscriptions() {
  const cacheKey = "/api/Subscription";
  const { data, error, isValidating, mutate } =
    useSWR<GetAPISubscriptionsResponse>(cacheKey, getFetcher);

  return {
    data: data?.data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useGetTemplates() {
  const currentUser = getCurrentUser();
  const cacheKey = "/api/Dashboard";

  const fetcher = async (url: string) => {
    if (currentUser?.user_role === "useradmin") {
      url += `/?or[company]=${currentUser?.company}&or[sharedWith]=${currentUser?._id}`;
    } else if (currentUser?.user_role === "executive") {
      url += `/?or[createdBy]=${currentUser?._id}`;
    }
    const response = await customAxios.get(url);
    return response.data;
  };

  const { data, error, isValidating, mutate } = useSWR<GetTemplatesResponse>(
    cacheKey,
    fetcher
  );

  return {
    data: data?.data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useGetTemplateById(templateId: string | null) {
  const cacheKey = templateId ? `/api/Dashboard/${templateId}` : null;
  const { data, error, isValidating, mutate } =
    useSWR<CreateOrUpdateTemplateResponse>(cacheKey, getFetcher);

  return {
    data: data?.data,
    error,
    isLoading: cacheKey ? !error && !data : false,
    isValidating,
    mutate,
  };
}

export function useGetDashboardData() {
  const cacheKey = "/dashboard-data";

  const { data, error, isValidating, mutate } =
    useSWR<GetDashboardDataResponse | DashboardData>(cacheKey, getFetcher);

  const raw = data as unknown;
  const unwrapped: DashboardData | null =
    raw && typeof raw === "object" && "data" in (raw as any)
      ? ((raw as any).data as DashboardData)
      : (raw as DashboardData) ?? null;

  const isDashboardFormat =
    unwrapped && typeof unwrapped === "object" && "devicesOnboarded" in unwrapped;

  return {
    data: isDashboardFormat ? unwrapped : null,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useGetOutdoorAQIData(geoLocation: string | null) {
  const cacheKey = geoLocation ? `/api/OutdoorAQIData/${geoLocation}` : null;

  const { data, error, isValidating, mutate } = useSWR<AQICNGeoFeedResponse>(
    cacheKey,
    async () => {
      const response = await aqicnAxios.get(
        `/feed/geo:${geoLocation}/?token=${import.meta.env.VITE_AQICN_API_TOKEN}`
      );
      return response.data;
    }
  );

  return {
    data: data?.data,
    error,
    isLoading: cacheKey ? !error && !data : false,
    isValidating,
    mutate,
  };
}

//
// ✅ FIXED FUNCTION — FRAME-1 INDOOR DATA (LATEST ONLY)
// --------------------------------------------------------------
export function useGetLatestAQILogByDevice(deviceId: string | null, role: string) {
  const cacheKey = deviceId ? [`latest-aqi-log`, role, deviceId] : null;

  const { data, error, isLoading } = useSWR(
    cacheKey,
    async () => {
      if (!deviceId) return null;

      const response = await customAxios.get(`/aqi-logs-filtered/${role}`);

      const logs = response.data?.data?.data || [];

      console.log("=== LATEST AQI DEBUG ===");
      console.log("RAW DATA:", response.data);
      console.log("LOGS COUNT:", logs.length);
      console.log("DEVICE ID:", deviceId);
      console.log(
        "FILTERED MIDs:",
        logs.map((l: any) => l.mid)
      );

      // Filter for this device MID
      const filtered = logs.filter((log: any) => log.mid === deviceId);

      if (filtered.length === 0) return null;

      // Pick latest (sorted by timestamp)
      const latest = filtered.sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      return {
        indoor_air_quality: latest.indoor_air_quality,
        outdoor_air_quality: latest.outdoor_air_quality || [],
        timestamp: latest.timestamp,
      };
    },
    {
      refreshInterval: 20000,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}
