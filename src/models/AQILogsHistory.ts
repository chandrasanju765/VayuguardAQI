import type { APIResponse, AQILog, AQILogsColumns } from "./common";

export interface Averages {
  humidity?: number;
  temp?: number;
  "pm2.5"?: number;
  "pm10.0"?: number;
  co2?: number;
  tvoc?: number;
  hcho?: number;
}

export interface GetAQILogsHistoryByDeviceIDResponse
  extends APIResponse<{
    columns: AQILogsColumns;
    data: AQILog[];
    indoor_avg: Averages;
    outdoor_avg: Averages;
  }> {}

export interface GetExcelForAQILogsResponse {}

export interface GetExcelForAQILogsRequest {
  deviceId: string;
  startDate: string;
  endDate: string;
}
