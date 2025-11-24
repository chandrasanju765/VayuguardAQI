import { atom } from "jotai";
import aqiRangeMapping from "../assets/aqiRangeMapping.json";

export type AQIStandardType = "WHO" | "USEPA" | "CPCB";

export interface RangeItem {
  min: number;
  max: number;
  bgColor: string;
  label?: string;
}

export interface RangeMapping {
  [parameter: string]: RangeItem[];
}

const getStoredAQIStandard = (): AQIStandardType => {
  if (typeof window === "undefined") return "WHO";

  try {
    const stored = localStorage.getItem("selectedAQIStandard");
    if (stored && isValidAQIStandard(stored)) {
      return stored as AQIStandardType;
    }
  } catch (error) {
    console.warn("Failed to read AQI standard from localStorage:", error);
  }

  return "WHO";
};

const isValidAQIStandard = (value: string): boolean => {
  const validStandards: AQIStandardType[] = ["WHO", "USEPA", "CPCB"];
  return validStandards.includes(value as AQIStandardType);
};

const baseSelectedAQIStandardAtom = atom<AQIStandardType>(
  getStoredAQIStandard()
);

export const selectedAQIStandardAtom = atom<
  AQIStandardType,
  [AQIStandardType],
  void
>(
  (get) => get(baseSelectedAQIStandardAtom),
  (_get, set, newValue) => {
    set(baseSelectedAQIStandardAtom, newValue);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedAQIStandard", newValue);
      } catch (error) {
        console.warn("Failed to save AQI standard to localStorage:", error);
      }
    }
  }
);

export const currentRangeMappingAtom = atom((get) => {
  const selectedStandard = get(selectedAQIStandardAtom);

  switch (selectedStandard) {
    case "WHO":
      return aqiRangeMapping.WHO as any;
    case "USEPA":
      return aqiRangeMapping.USEPA as any;
    case "CPCB":
      return aqiRangeMapping.CPCB as any;
    default:
      return aqiRangeMapping.WHO as any;
  }
});

export const getColorForValue = (
  value: number,
  parameter: string,
  rangeMapping: any
): string => {
  const ranges = rangeMapping[parameter];
  if (!ranges) return "#ffffff";

  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      return range.bgColor;
    }
  }

  return "#ffffff";
};
