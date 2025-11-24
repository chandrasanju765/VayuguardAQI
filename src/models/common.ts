export interface APIResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export type RoleCode = "admin" | "customer";

export type UserRoleCode = "useradmin" | "executive";

export type SubscriptionType = "Basic" | "Premium" | "Elite";

export interface User {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_role: UserRoleCode;
  password: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AQILogsColumns {
  mid: string; // Dev Note: This is AQI Device ID
  timestamp: string;
  indoor_pm25: string;
  indoor_pm10: string;
  indoor_tvoc: string;
  indoor_co: string;
  indoor_co2: string;
  indoor_humidity: string;
  indoor_temp: string;
  indoor_hcho: string;
  indoor_so2: string;
  indoor_no: string;
  indoor_no2: string;
  indoor_o2: string;
  indoor_o3: string;
  indoor_nh3: string;
  indoor_ch4: string;
  outdoor_pm25: string;
  outdoor_pm10: string;
  outdoor_tvoc: string;
  outdoor_co: string;
  outdoor_co2: string;
  outdoor_humidity: string;
  outdoor_temp: string;
  outdoor_hcho: string;
  outdoor_so2: string;
  outdoor_no: string;
  outdoor_no2: string;
  outdoor_o2: string;
  outdoor_o3: string;
  outdoor_nh3: string;
  outdoor_ch4: string;
}

export type AirQualityParameterName =
  | "humidity"
  | "temp"
  | "pm2.5"
  | "pm10.0"
  | "co2"
  | "tvoc"
  | "hcho"
  | "co"
  | "so2"
  | "no"
  | "no2"
  | "o2"
  | "o3"
  | "nh3"
  | "ch4";

export interface AirQualityParameter {
  param: AirQualityParameterName;
  label: string;
  value: number;
  unit: string;
}

export interface AQILog {
  _id: string;
  mid: string;
  indoor_air_quality: AirQualityParameter[];
  outdoor_air_quality: AirQualityParameter[];
  timestamp: string;
}
