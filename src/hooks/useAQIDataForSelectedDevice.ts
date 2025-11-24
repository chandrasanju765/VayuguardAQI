import { useMemo } from "react";
import { useAtomValue } from "jotai";
import dayjs from "dayjs";
import { selectedDeviceAtom } from "../atoms/selectedDevice";
import { useGetAQILogsHistoryByDeviceID } from "../data/cachedQueries";

export interface UseAQIDataOptions {
  daysBack?: number; // How many days back from today (default: 1 = yesterday to today)
  startDate?: string; // Custom start date in YYYY-MM-DD format
  endDate?: string; // Custom end date in YYYY-MM-DD format
}

/**
 * Custom hook to get AQI data for the currently selected device
 * Uses the device from localStorage via global atom
 */
export const useAQIDataForSelectedDevice = (
  options: UseAQIDataOptions = {}
) => {
  const {
    daysBack = 1,
    startDate: customStartDate,
    endDate: customEndDate,
  } = options;
  const selectedDevice = useAtomValue(selectedDeviceAtom);

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    if (customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const today = dayjs();
    const start = today.subtract(daysBack, "day");

    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  }, [daysBack, customStartDate, customEndDate]);

  // Call the API
  const { data, error, isLoading, mutate } = useGetAQILogsHistoryByDeviceID({
    deviceId: selectedDevice?.deviceId ?? null,
    startDate,
    endDate,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
    selectedDevice,
    startDate,
    endDate,
    hasDeviceSelected: Boolean(selectedDevice),
  };
};
