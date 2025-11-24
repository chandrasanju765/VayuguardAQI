import type { GetExcelForAQILogsRequest } from "../models/AQILogsHistory";
import type { AQICNApiResponse } from "../types";
import customAxios, { aqicnAxios } from "./config";

// This file contains one-time queries that are not cached
export async function fetchStationsByCity(
  city: string
): Promise<AQICNApiResponse | undefined> {
  try {
    const token = import.meta.env.VITE_AQICN_API_TOKEN;
    const cityName = city.split(" - ")[1];
    if (!token) {
      console.error("AQICN API token not found in environment variables");
      return;
    }

    const response = await aqicnAxios.get(
      `/search/?keyword=${encodeURIComponent(cityName)}&token=${token}`
    );

    const data: AQICNApiResponse = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching AQI data:", error);
  }
}

export async function getExcelForAQILogs({
  deviceId,
  startDate,
  endDate,
}: GetExcelForAQILogsRequest) {
  try {
    const response = await customAxios.get(
      `/aqi-logs-excel/get/excel?mid=${deviceId}&start=${startDate}&end=${endDate}`,
      {
        responseType: "blob", // Important for binary file downloads
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching AQI logs:", error);
    throw error;
  }
}
