/**
 * AQICN API Response Types
 * API Documentation: https://aqicn.org/json-api/doc/
 */

export interface AQICNTimeData {
  tz: string;
  stime: string;
  vtime: number;
}

export interface AQICNStationGeo {
  0: number; // latitude
  1: number; // longitude
}

export interface AQICNStation {
  name: string;
  geo: AQICNStationGeo;
  url: string;
  country: string;
}

export interface AQICNDataItem {
  uid: number;
  aqi: string;
  time: AQICNTimeData;
  station: AQICNStation;
}

export interface AQICNApiResponse {
  status: string;
  data: AQICNDataItem[];
}

/**
 * Individual Air Quality Index (IAQI) measurements
 */
export interface IAQIMeasurement {
  v: number; // value
}

export interface AQICNIAQIData {
  co?: IAQIMeasurement; // Carbon monoxide
  h?: IAQIMeasurement; // Humidity
  no2?: IAQIMeasurement; // Nitrogen dioxide
  o3?: IAQIMeasurement; // Ozone
  p?: IAQIMeasurement; // Pressure
  pm10?: IAQIMeasurement; // PM10
  pm25?: IAQIMeasurement; // PM2.5
  t?: IAQIMeasurement; // Temperature
  so2?: IAQIMeasurement; // Sulfur dioxide
}

export interface AQICNCity {
  geo: number[];
  name: string;
  url: string;
}

/**
 * Response from /feed/geo: endpoint
 */
export interface AQICNGeoFeedData {
  aqi: number;
  idx: number;
  city: AQICNCity;
  dominentpol: string;
  iaqi: AQICNIAQIData;
  time: AQICNTimeData;
}

export interface AQICNGeoFeedResponse {
  status: string;
  data: AQICNGeoFeedData;
}

/**
 * Station option for dropdown rendering
 */
export interface StationOption {
  value: string; // station URL
  label: string; // station name with AQI
  uid: number; // unique identifier
  aqi: string; // air quality index value
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
