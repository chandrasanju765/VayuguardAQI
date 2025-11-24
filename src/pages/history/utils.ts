import type { AQIStandardType } from "../../atoms/aqiStandard";

export const periodOptions: { label: string; value: string }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

// Type definitions for air quality data
export interface AirQualityParam {
  param: string;
  value: number;
}

export interface AQILogEntry {
  timestamp: string;
  indoor_air_quality?: AirQualityParam[];
}

export interface ChartDataPoint {
  time: string;
  value: number;
  hour?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  entryCount: number;
  fullTimestamp: string;
  color: string;
}

export interface MetricConfiguration {
  label: string;
  unit: string;
  param: string;
  getValue: (log: AQILogEntry) => number;
}

// Constants for AQI calculations and chart configuration
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const MONTHS_IN_YEAR = 12;

export const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

// Note: Day index mapping for weekly view
// JavaScript's Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
// Our mapping: 0=Monday, 1=Tuesday, ..., 6=Sunday

export const CHART_CONFIG = {
  height: 425,
  barSize: 14,
  borderRadius: [6, 6, 0, 0] as [number, number, number, number],
  padding: { top: 20, right: 30, left: 20, bottom: 20 },
  yAxisPadding: 0.1,
  roundingFactor: 10,
} as const;

// Utility functions for AQI calculations and data processing

/**
 * Calculate AQI value based on PM2.5 and PM10 values using Indian AQI standards
 * @param pm25 PM2.5 value in µg/m³
 * @param pm10 PM10 value in µg/m³
 * @param tvoc TVOC value in µg/m³ (optional, used for CPCB standard)
 * @param hcho HCHO value in µg/m³ (optional, used for CPCB standard)
 * @param standard AQI standard type (optional, defaults to current calculation for non-CPCB)
 * @returns Calculated AQI value
 */
export const calculateAQI = (
  pm25?: number,
  pm10?: number,
  tvoc?: number,
  hcho?: number,
  standard?: AQIStandardType
): number => {
  if (standard === "CPCB") {
    const values = [
      pm25 !== undefined && pm25 !== null ? pm25 : undefined,
      pm10 !== undefined && pm10 !== null ? pm10 : undefined,
      tvoc !== undefined && tvoc !== null ? tvoc : undefined,
      hcho !== undefined && hcho !== null ? hcho : undefined,
    ].filter((v) => v !== undefined) as number[];

    if (values.length === 0) return 0;
    return Math.round(Math.max(...values));
  }

  if (!pm25 && !pm10) return 0;

  const aqiBreakpoints = {
    pm25: [
      { min: 0, max: 30, aqiMin: 0, aqiMax: 50 },
      { min: 31, max: 60, aqiMin: 51, aqiMax: 100 },
      { min: 61, max: 90, aqiMin: 101, aqiMax: 200 },
      { min: 91, max: 120, aqiMin: 201, aqiMax: 300 },
      { min: 121, max: 250, aqiMin: 301, aqiMax: 400 },
      { min: 251, max: 500, aqiMin: 401, aqiMax: 500 },
    ],
    pm10: [
      { min: 0, max: 50, aqiMin: 0, aqiMax: 50 },
      { min: 51, max: 100, aqiMin: 51, aqiMax: 100 },
      { min: 101, max: 250, aqiMin: 101, aqiMax: 200 },
      { min: 251, max: 350, aqiMin: 201, aqiMax: 300 },
      { min: 351, max: 430, aqiMin: 301, aqiMax: 400 },
      { min: 431, max: 600, aqiMin: 401, aqiMax: 500 },
    ],
  };

  function calculateSubIndex(
    concentration: number,
    breakpoints: { min: number; max: number; aqiMin: number; aqiMax: number }[]
  ): number {
    for (let i = 0; i < breakpoints.length; i++) {
      const bp = breakpoints[i];
      if (concentration >= bp.min && concentration <= bp.max) {
        return (
          ((bp.aqiMax - bp.aqiMin) / (bp.max - bp.min)) *
            (concentration - bp.min) +
          bp.aqiMin
        );
      }
    }
    return -1;
  }

  let pm25SubIndex =
    pm25 !== undefined && pm25 !== null
      ? calculateSubIndex(pm25, aqiBreakpoints.pm25)
      : null;
  let pm10SubIndex =
    pm10 !== undefined && pm10 !== null
      ? calculateSubIndex(pm10, aqiBreakpoints.pm10)
      : null;

  if (pm25SubIndex === null && pm10SubIndex === null) {
    return 0;
  }

  if (pm25SubIndex === null) return Math.round(pm10SubIndex!);
  if (pm10SubIndex === null) return Math.round(pm25SubIndex);

  return Math.round(Math.max(pm25SubIndex, pm10SubIndex));
};

/**
 * Find a specific parameter value from air quality parameters array
 * @param params Array of air quality parameters
 * @param paramName Name of the parameter to find
 * @returns Parameter value or 0 if not found
 */
export const findParamValue = (
  params: AirQualityParam[],
  paramName: string
): number => {
  return params?.find((param) => param.param === paramName)?.value ?? 0;
};

/**
 * Format hour number to time string (HH:00)
 * @param hour Hour number (0-23)
 * @returns Formatted time string
 */
export const formatTime = (hour: number): string =>
  hour.toString().padStart(2, "0") + ":00";

/**
 * Get weekday name from day index (0 = Monday, 6 = Sunday)
 * @param dayIndex Day index (0-6)
 * @returns Weekday name
 */
export const getWeekdayName = (dayIndex: number): string => {
  return WEEKDAY_NAMES[dayIndex] || "Unknown";
};

/**
 * Get month name with year (e.g., "Jan 2025")
 * @param monthIndex Month index (0-11, where 0 = January)
 * @param year Full year (e.g., 2025)
 * @returns Month name with year
 */
export const getMonthName = (monthIndex: number, year: number): string => {
  const monthName = MONTH_NAMES[monthIndex] || "Unknown";
  return `${monthName} ${year}`;
};

/**
 * Round number to specified decimal places
 * @param value Number to round
 * @param decimals Number of decimal places (default: 2)
 * @returns Rounded number
 */
export const roundToDecimals = (value: number, decimals = 2): number =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

/**
 * Get metric configuration for different air quality parameters
 * @param selectedMetric The selected metric type
 * @param standard AQI standard type (optional, used for AQI calculations)
 * @returns Configuration object for the metric
 */
export const getMetricConfig = (
  selectedMetric: string,
  standard?: AQIStandardType
): MetricConfiguration => {
  const configs: Record<string, MetricConfiguration> = {
    aqi: {
      label: "AQI Average",
      unit: "",
      param: "aqi",
      getValue: (log: AQILogEntry) => {
        const pm25 = findParamValue(log.indoor_air_quality || [], "pm2.5");
        const pm10 = findParamValue(log.indoor_air_quality || [], "pm10.0");
        const tvoc = findParamValue(log.indoor_air_quality || [], "tvoc");
        const hcho = findParamValue(log.indoor_air_quality || [], "hcho");
        return calculateAQI(pm25, pm10, tvoc, hcho, standard);
      },
    },
    tvoc: {
      label: "TVOC Average",
      unit: "µg/m³",
      param: "tvoc",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "tvoc"),
    },
    humidity: {
      label: "Humidity Average",
      unit: "%",
      param: "humidity",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "humidity"),
    },
    temp: {
      label: "Temperature Average",
      unit: "°C",
      param: "temp",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "temp"),
    },
    "pm2.5": {
      label: "PM 2.5 Average",
      unit: "µg/m³",
      param: "pm2.5",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "pm2.5"),
    },
    "pm10.0": {
      label: "PM 10.0 Average",
      unit: "µg/m³",
      param: "pm10.0",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "pm10.0"),
    },
    co2: {
      label: "CO2 Average",
      unit: "ppm",
      param: "co2",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "co2"),
    },
    hcho: {
      label: "HCHO Average",
      unit: "µg/m³",
      param: "hcho",
      getValue: (log: AQILogEntry) =>
        findParamValue(log.indoor_air_quality || [], "hcho"),
    },
  };

  return configs[selectedMetric] || configs.aqi;
};

export const getAQIQualityInfo = (aqi: number, _: any) => {
  let quality = "Good";
  let color = "#90be6d";

  if (aqi <= 50) {
    quality = "Good";
    color = "#90be6d";
  } else if (aqi <= 100) {
    quality = "Moderate";
    color = "#f8961e";
  } else if (aqi <= 150) {
    quality = "Unhealthy for Sensitive Groups";
    color = "#f3722c";
  } else if (aqi <= 200) {
    quality = "Unhealthy";
    color = "#ee0b00";
  } else if (aqi <= 300) {
    quality = "Very Unhealthy";
    color = "#560bad";
  } else {
    quality = "Hazardous";
    color = "#472d30";
  }

  return { quality, color };
};
