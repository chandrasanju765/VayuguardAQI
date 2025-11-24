import { atom } from "jotai";
import { periodOptions } from "./utils";

export const selectedPeriodAtom = atom<string>(periodOptions[0].value);

// Available metrics for selection
export type SelectedMetricType =
  | "aqi"
  | "humidity"
  | "temp"
  | "pm2.5"
  | "pm10.0"
  | "co2"
  | "tvoc"
  | "hcho";

// Atom for the currently selected metric (default to AQI)
export const selectedMetricAtom = atom<SelectedMetricType>("aqi");
