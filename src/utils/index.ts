import dayjs from "dayjs";
import type { AQIDevice, AQIDeviceStatus } from "../models/AQIDevices";
import type { SubscriptionType } from "../models/common";
import type { AQICNGeoFeedData } from "../types/aqicn";
import type { Averages } from "../models/AQILogsHistory";
import type { AuthUser } from "../pages/login/utils";

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export const AQI_DEVICE_STATUS_OPTIONS: SelectOption<AQIDeviceStatus>[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
];

export const SUBSCRIPTION_TYPE_OPTIONS: SelectOption<SubscriptionType>[] = [
  { value: "Basic", label: "Basic" },
  { value: "Premium", label: "Premium" },
  { value: "Elite", label: "Elite" },
];

export const getAQIDeviceStatusLabel = (status: AQIDeviceStatus): string => {
  const option = AQI_DEVICE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label ?? status;
};

export const getSubscriptionTypeLabel = (type: SubscriptionType): string => {
  const option = SUBSCRIPTION_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.label ?? type;
};

export const formatDate = (
  dateStr: string | null,
  format: string = "DD-MM-YYYY"
): string => {
  if (!dateStr) return "";

  const date = dayjs(dateStr);
  if (!date.isValid()) return "";

  // Special case for ISO format
  if (format.toLowerCase() === "iso") {
    return date.toISOString();
  }

  return date.format(format);
};

export const calculateDaysRemaining = (targetDate: string): number => {
  const today = dayjs();
  const endDate = dayjs(targetDate);

  if (!endDate.isValid()) {
    throw new Error("Invalid date format. Please provide a valid date string.");
  }

  const daysRemaining = endDate.diff(today, "day");
  return daysRemaining > 0 ? daysRemaining : 0;
};

export const getRangeDates = (period: string) => {
  const end = dayjs();
  let days = 1;
  if (period === "day") days = 2;
  else if (period === "week") days = 7;
  else if (period === "month") days = 30;
  else if (period === "year") days = 365;

  const start = end.subtract(days - 1, "day");

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
};

export const transformAQICNDataToAverages = (
  aqicnData: AQICNGeoFeedData | undefined
): Averages | undefined => {
  if (!aqicnData?.iaqi) {
    return undefined;
  }

  const iaqi = aqicnData.iaqi;

  return {
    humidity: iaqi.h?.v,
    temp: iaqi.t?.v,
    "pm2.5": iaqi.pm25?.v,
    "pm10.0": iaqi.pm10?.v,
    co2: undefined,
    tvoc: undefined,
    hcho: undefined,
  };
};

export function filterDevicesForUser(
  devices: AQIDevice[] | undefined
): AQIDevice[] {
  if (!devices) return [];

  let currentUser: AuthUser | null = null;
  const userStr = localStorage.getItem("auth");
  if (userStr) {
    currentUser = JSON.parse(userStr);
  }
  if (currentUser?.role !== "admin") {
    return devices.filter(
      (device) => device.assignedUserId?._id === currentUser?._id
    );
  }
  return devices;
}

export function getCurrentUser(): AuthUser | null {
  const userStr = localStorage.getItem("auth");
  if (userStr) {
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  }
  return null;
}
