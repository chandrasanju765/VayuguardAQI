import aqiRangeMapping from "../../../assets/aqiRangeMapping.json";
import type { AQIStandardType } from "../../../atoms/aqiStandard";
import { calculateAQI } from "../../history/utils";

export interface ColorRange {
  min: number;
  max: number;
  bgColor: string;
  textColor: string;
  label?: string;
}

export type MetricType =
  | "pm2_5"
  | "pm10"
  | "pm10.0"
  | "temp"
  | "temperature"
  | "co2"
  | "tvoc"
  | "hcho"
  | "co"
  | "ozone"
  | "no2"
  | "humidity"
  | "aqi";

export function getColorForValue(
  value: number,
  metricType: MetricType,
  standard: AQIStandardType = "WHO"
): { bgColor: string; textColor: string } {
  // Map some metric types to their JSON equivalents
  const jsonMetricType =
    metricType === "pm2_5"
      ? "pm2.5"
      : metricType === "temperature"
      ? "temp"
      : metricType === "pm10"
      ? "pm10.0"
      : metricType;

  const standardData = aqiRangeMapping[standard];
  const metricRanges =
    standardData?.[jsonMetricType as keyof typeof standardData];

  if (!metricRanges || !Array.isArray(metricRanges)) {
    // Fallback to default colors if metric not found
    return { bgColor: "#6b7280", textColor: "#ffffff" };
  }

  for (const range of metricRanges) {
    if (value >= range.min && value <= range.max) {
      return { bgColor: range.bgColor, textColor: "#000" };
    }
  }

  // Fallback if no range matches
  return { bgColor: "#6b7280", textColor: "#ffffff" };
}

export function getQualityLabel(
  value: number,
  metricType: MetricType,
  standard: AQIStandardType = "WHO"
): string {
  // Map some metric types to their JSON equivalents
  const jsonMetricType =
    metricType === "pm2_5"
      ? "pm2.5"
      : metricType === "temperature"
      ? "temp"
      : metricType === "pm10"
      ? "pm10.0"
      : metricType;

  const standardData = aqiRangeMapping[standard];
  const metricRanges =
    standardData?.[jsonMetricType as keyof typeof standardData];

  if (!metricRanges || !Array.isArray(metricRanges)) {
    return "Unknown";
  }

  for (const range of metricRanges) {
    if (
      value >= range.min &&
      value <= range.max &&
      "label" in range &&
      range.label
    ) {
      return range.label;
    }
  }

  // Fallback based on color if no label found
  const { bgColor } = getColorForValue(value, metricType, standard);
  switch (bgColor) {
    case "#90be6d":
      return "Good";
    case "#f8961e":
      return "Moderate";
    case "#f3722c":
      return "Unhealthy for Sensitive Groups";
    case "#ee0b00":
      return "Unhealthy";
    case "#560bad":
      return "Very Unhealthy";
    case "#472d30":
      return "Hazardous";
    default:
      return "Unknown";
  }
}

export const environmentalMetrics = [
  {
    icon: "/icon-3.png",
    label: "PM2.5",
    value: "-",
    metricType: "pm2_5" as MetricType,
    alt: "Cloud",
    textColor: "#000",
  },
  {
    icon: "/icon-4.png",
    label: "PM10.0",
    value: "-",
    metricType: "pm10" as MetricType,
    textColor: "#000",
    alt: "Wind",
  },
  {
    icon: "/icon-5.png",
    label: "TVOC",
    value: "-",
    metricType: "tvoc" as MetricType,
    alt: "Activity",
    textColor: "#000",
  },
  {
    icon: "/icon-6.png",
    label: "CO2",
    value: "-",
    metricType: "co2" as MetricType,
    alt: "Gas",
    textColor: "#000",
  },
  {
    icon: "/icon-2.png",
    label: "Temperature",
    value: "-",
    metricType: "temperature" as MetricType,
    alt: "Thermometer",
    textColor: "#000",
  },
  {
    icon: "/icon-1.png",
    label: "Humidity",
    value: "-",
    metricType: "humidity" as MetricType,
    alt: "Droplets",
    textColor: "#000",
  },
];

// Interface for indoor average data
export interface IndoorAvgData {
  humidity?: number | null;
  temp?: number | null;
  "pm2.5"?: number | null;
  "pm10.0"?: number | null;
  tvoc?: number | null;
  hcho?: number | null;
  co2?: number | null;
}

// Interface for outdoor AQICN API data
export interface OutdoorAQIData {
  aqi?: number | null;
  iaqi?: {
    h?: { v: number }; // humidity
    t?: { v: number }; // temperature
    pm25?: { v: number }; // PM2.5
    pm10?: { v: number }; // PM10
    co?: { v: number }; // CO
    no2?: { v: number }; // NO2
    o3?: { v: number }; // Ozone
  };
}

// Calculate dynamic environmental metrics from API data
export function calculateDynamicEnvironmentalMetrics(
  indoorData?: IndoorAvgData
) {
  if (!indoorData) {
    // Return metrics with '-' values if no data
    return environmentalMetrics.map((metric) => ({
      ...metric,
      value: "-",
      apiValue: null,
    }));
  }

  return environmentalMetrics.map((metric) => {
    let value = "-"; // Default to '-' if no data
    let apiValue = null;
    let textColor = "#000";

    switch (metric.metricType) {
      case "pm2_5":
        apiValue = indoorData["pm2.5"];
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "pm2_5").bgColor;
        }
        break;
      case "pm10":
        apiValue = indoorData["pm10.0"];
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "pm10").bgColor;
        }
        break;
      case "tvoc":
        apiValue = indoorData.tvoc;
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "tvoc").bgColor;
        }
        break;
      case "humidity":
        apiValue = indoorData.humidity;
        if (apiValue) {
          value = `${Math.round(apiValue)}%`;
          textColor = getColorForValue(apiValue, "humidity").bgColor;
        }
        break;
      case "temperature":
        apiValue = indoorData.temp;
        if (apiValue) {
          value = `${Math.round(apiValue)}°C`;
          textColor = getColorForValue(apiValue, "temperature").bgColor;
        }
        break;
      case "hcho":
        apiValue = indoorData.hcho;
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "hcho").bgColor;
        }
        break;
      case "co2":
        apiValue = indoorData.co2;
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "co2").bgColor;
        }
        break;
      default:
        break;
    }

    return {
      ...metric,
      value,
      apiValue,
      textColor,
    };
  });
}

// Calculate AQI information from PM2.5 and PM10 data
export function calculateAQIInfo(
  indoorData?: IndoorAvgData,
  standard: AQIStandardType = "WHO"
) {
  if (
    !indoorData ||
    ((!indoorData["pm2.5"] || indoorData["pm2.5"] === null) &&
      (!indoorData["pm10.0"] || indoorData["pm10.0"] === null) &&
      (!indoorData.tvoc || indoorData.tvoc === null) &&
      (!indoorData.hcho || indoorData.hcho === null))
  ) {
    return {
      aqi: 0,
      quality: "-",
      colors: { bgColor: "#6b7280", textColor: "#ffffff" },
    };
  }

  const pm25Value = indoorData["pm2.5"] || undefined;
  const pm10Value = indoorData["pm10.0"] || undefined;
  const tvocValue = indoorData.tvoc || undefined;
  const hchoValue = indoorData.hcho || undefined;

  const aqi = calculateAQI(
    pm25Value,
    pm10Value,
    tvocValue,
    hchoValue,
    standard
  );

  const colors = getColorForValue(aqi, "aqi", standard);
  const quality = getQualityLabel(aqi, "aqi", standard);

  return { aqi, quality, colors };
}

export function calculateOutdoorEnvironmentalMetrics(
  outdoorData?: OutdoorAQIData
) {
  if (!outdoorData?.iaqi) {
    return environmentalMetrics.map((metric) => ({
      ...metric,
      value: "-",
      apiValue: null,
    }));
  }

  const iaqi = outdoorData.iaqi;

  return environmentalMetrics.map((metric) => {
    let value = "-"; // Default to '-' if no data
    let apiValue = null;
    let textColor = "#000";

    // Map metric types to AQICN API response fields
    switch (metric.metricType) {
      case "humidity":
        apiValue = iaqi.h?.v;
        if (apiValue) {
          value = `${Math.round(apiValue)}%`;
          textColor = getColorForValue(apiValue, "humidity").bgColor;
        }
        break;
      case "temperature":
        apiValue = iaqi.t?.v;
        if (apiValue) {
          value = `${Math.round(apiValue)}°C`;
          textColor = getColorForValue(apiValue, "temperature").bgColor;
        }
        break;
      case "pm2_5":
        apiValue = iaqi.pm25?.v;
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "pm2_5").bgColor;
        }
        break;
      case "pm10":
        apiValue = iaqi.pm10?.v;
        if (apiValue) {
          value = Math.round(apiValue).toString();
          textColor = getColorForValue(apiValue, "pm10").bgColor;
        }
        break;
      case "tvoc":
        // TVOC is not typically available in AQICN data, keep default
        break;
      case "hcho":
        // HCHO is not typically available in AQICN data, keep default
        break;
      default:
        break;
    }

    return {
      ...metric,
      value,
      apiValue,
      textColor,
    };
  });
}

// Calculate outdoor AQI information from AQICN API data
export function calculateOutdoorAQIInfo(
  outdoorData?: OutdoorAQIData,
  standard: AQIStandardType = "WHO"
) {
  if (
    !outdoorData ||
    outdoorData.aqi === undefined ||
    outdoorData.aqi === null
  ) {
    return {
      aqi: 0,
      quality: "-",
      colors: { bgColor: "#6b7280", textColor: "#ffffff" },
    };
  }

  // AQICN API already provides the calculated AQI value
  const aqiValue = outdoorData.aqi;

  // Use the AQI value directly with AQI ranges from JSON for consistent results
  const colors = getColorForValue(aqiValue, "aqi", standard);
  const quality = getQualityLabel(aqiValue, "aqi", standard);

  return { aqi: aqiValue, quality, colors };
}

export interface ComparisonAirQualityData {
  value: string;
  status: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  pointerLeft: string;
}

export interface AQIComparisonData {
  indoor_avg?: {
    "pm2.5"?: number | null;
  };
  outdoor_avg?: {
    "pm2.5"?: number | null;
  };
}

// Calculate air quality data for comparison frame
export function calculateComparisonAirQualityData(
  aqiData?: AQIComparisonData,
  standard: AQIStandardType = "WHO"
): ComparisonAirQualityData[] {
  if (!aqiData || !aqiData.indoor_avg || !aqiData.outdoor_avg) {
    return [
      {
        value: "--",
        status: "No Data",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        textColor: "#6b7280",
        description: "PM 2.5 - No indoor data available",
        pointerLeft: "left-1",
      },
      {
        value: "--",
        status: "No Data",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        textColor: "#6b7280",
        description: "PM 2.5 - No outdoor data available",
        pointerLeft: "left-[57px]",
      },
    ];
  }

  const indoorPM25 = aqiData.indoor_avg["pm2.5"];
  const outdoorPM25 = aqiData.outdoor_avg["pm2.5"];

  // Handle cases where PM2.5 data might be null or undefined
  if (
    indoorPM25 === null ||
    indoorPM25 === undefined ||
    outdoorPM25 === null ||
    outdoorPM25 === undefined
  ) {
    return [
      {
        value:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? Math.round(indoorPM25).toString()
            : "--",
        status:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? getQualityLabel(indoorPM25, "pm2_5", standard)
            : "No Data",
        color:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? getColorForValue(indoorPM25, "pm2_5", standard).bgColor
            : "#6b7280",
        bgColor:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? getColorForValue(indoorPM25, "pm2_5", standard).bgColor + "33"
            : "#f3f4f6",
        textColor:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? getColorForValue(indoorPM25, "pm2_5", standard).bgColor
            : "#6b7280",
        description:
          indoorPM25 !== null && indoorPM25 !== undefined
            ? `PM 2.5 - ${Math.round(indoorPM25)}mg/m³ indoor air pollution`
            : "PM 2.5 - No indoor data available",
        pointerLeft: "left-1",
      },
      {
        value:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? Math.round(outdoorPM25).toString()
            : "--",
        status:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? getQualityLabel(outdoorPM25, "pm2_5", standard)
            : "No Data",
        color:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? getColorForValue(outdoorPM25, "pm2_5", standard).bgColor
            : "#6b7280",
        bgColor:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? getColorForValue(outdoorPM25, "pm2_5", standard).bgColor + "33"
            : "#f3f4f6",
        textColor:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? getColorForValue(outdoorPM25, "pm2_5", standard).bgColor
            : "#6b7280",
        description:
          outdoorPM25 !== null && outdoorPM25 !== undefined
            ? `PM 2.5 - ${Math.round(outdoorPM25)}mg/m³ outdoor air pollution`
            : "PM 2.5 - No outdoor data available",
        pointerLeft: "left-[57px]",
      },
    ];
  }

  const indoorValue = Math.round(indoorPM25);
  const outdoorValue = Math.round(outdoorPM25);

  const indoorColors = getColorForValue(indoorPM25, "pm2_5", standard);
  const outdoorColors = getColorForValue(outdoorPM25, "pm2_5", standard);

  const indoorStatus = getQualityLabel(indoorPM25, "pm2_5", standard);
  const outdoorStatus = getQualityLabel(outdoorPM25, "pm2_5", standard);

  return [
    {
      value: indoorValue.toString(),
      status: indoorStatus,
      color: indoorColors.bgColor,
      bgColor: indoorColors.bgColor + "33", // Add transparency
      textColor: indoorColors.bgColor,
      description: `PM 2.5 - ${indoorValue}mg/m³ indoor air pollution`,
      pointerLeft: "left-1",
    },
    {
      value: outdoorValue.toString(),
      status: outdoorStatus,
      color: outdoorColors.bgColor,
      bgColor: outdoorColors.bgColor + "33", // Add transparency
      textColor: outdoorColors.bgColor,
      description: `PM 10 - ${outdoorValue}mg/m³ outdoor air pollution`,
      pointerLeft: "left-[57px]",
    },
  ];
}

// Calculate pointer position for comparison frame scale
export function calculatePointerPosition(
  value: string,
  maxScale: number = 500,
  scaleWidth: number = 320,
  pointerWidth: number = 12
): number {
  if (value === "--") return 0;

  const numericValue = parseInt(value);
  return Math.min(
    (numericValue / maxScale) * scaleWidth,
    scaleWidth - pointerWidth
  );
}

// Helper function to map hex colors to Tailwind gradient classes
export function getAQITailwindClasses(
  aqiValue: number,
  standard: AQIStandardType = "WHO"
) {
  const colors = getColorForValue(aqiValue, "aqi", standard);
  const bgColor = colors.bgColor.toLowerCase();

  // Map hex colors to Tailwind classes based on the mapping
  const colorMappings: Record<
    string,
    { gradient: string; bg: string; dot: string; meter: string }
  > = {
    "#71b51a": {
      gradient: "to-green-400",
      bg: "bg-green-300",
      dot: "bg-green-400",
      meter: "top-4",
    },
    "#c8a600": {
      gradient: "to-yellow-400",
      bg: "bg-yellow-300",
      dot: "bg-yellow-400",
      meter: "top-20",
    },
    "#ea9b1d": {
      gradient: "to-orange-400",
      bg: "bg-orange-300",
      dot: "bg-orange-400",
      meter: "top-28",
    },
    "#e95675": {
      gradient: "to-red-400",
      bg: "bg-red-300",
      dot: "bg-red-400",
      meter: "top-36",
    },
    "#a250ee": {
      gradient: "to-pink-400",
      bg: "bg-pink-300",
      dot: "bg-pink-400",
      meter: "top-44",
    },
    "#a36464": {
      gradient: "to-violet-700",
      bg: "bg-violet-500",
      dot: "bg-violet-700",
      meter: "top-52",
    },
    "#009966": {
      gradient: "to-green-400",
      bg: "bg-green-300",
      dot: "bg-green-400",
      meter: "top-4",
    },
    "#ffde33": {
      gradient: "to-yellow-400",
      bg: "bg-yellow-300",
      dot: "bg-yellow-400",
      meter: "top-20",
    },
    "#ff9933": {
      gradient: "to-orange-400",
      bg: "bg-orange-300",
      dot: "bg-orange-400",
      meter: "top-28",
    },
    "#cc0033": {
      gradient: "to-red-400",
      bg: "bg-red-300",
      dot: "bg-red-400",
      meter: "top-36",
    },
    "#660099": {
      gradient: "to-purple-600",
      bg: "bg-purple-400",
      dot: "bg-purple-600",
      meter: "top-44",
    },
    "#800080": {
      gradient: "to-purple-700",
      bg: "bg-purple-500",
      dot: "bg-purple-700",
      meter: "top-52",
    },
  };

  // Find the closest matching color or use defaults
  return (
    colorMappings[bgColor] || {
      gradient: "to-gray-400",
      bg: "bg-gray-300",
      dot: "bg-gray-400",
      meter: "top-52",
    }
  );
}

// Helper function to get building image based on AQI
export function getBuildingImage(
  aqiValue: number,
  standard: AQIStandardType = "WHO"
): string {
  const colors = getColorForValue(aqiValue, "aqi", standard);
  const bgColor = colors.bgColor.toLowerCase();

  const buildingMappings: Record<string, string> = {
    "#71b51a": "/green-building.svg",
    "#c8a600": "/yellow-building.svg",
    "#ea9b1d": "/orange-building.svg",
    "#e95675": "/red-building.svg",
    "#a250ee": "/pink-building.svg",
    "#a36464": "/violet-building.svg",
    "#009966": "/green-building.svg",
    "#ffde33": "/yellow-building.svg",
    "#ff9933": "/orange-building.svg",
    "#cc0033": "/red-building.svg",
    "#660099": "/violet-building.svg",
    "#800080": "/violet-building.svg",
  };

  return buildingMappings[bgColor] || "/gray-building.svg";
}

export function getBoyImage(
  aqiValue: number,
  standard: AQIStandardType = "WHO"
): string {
  const colors = getColorForValue(aqiValue, "aqi", standard);
  const bgColor = colors.bgColor.toLowerCase();

  const boyMappings: Record<string, string> = {
    "#71b51a": "/green-boy.png",
    "#c8a600": "/yellow-boy.png",
    "#ea9b1d": "/orange-boy.png",
    "#e95675": "/red-boy.png",
    "#a250ee": "/maroon-boy.png",
    "#a36464": "/maroon-boy.png",
    "#009966": "/green-boy.png",
    "#ffde33": "/yellow-boy.png",
    "#ff9933": "/orange-boy.png",
    "#cc0033": "/red-boy.png",
    "#660099": "/maroon-boy.png",
    "#800080": "/maroon-boy.png",
  };

  return boyMappings[bgColor] || "/maroon-boy.png";
}

export interface MetricData {
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
}

// Function to get disclaimer message based on AQI value using global color standard
export const getAQIDisclaimerMessage = (
  aqiValue: number,
  standard: AQIStandardType = "WHO"
): string => {
  const qualityLabel = getQualityLabel(aqiValue, "aqi", standard);

  switch (qualityLabel) {
    case "Good":
      return "Enjoy the fresh air! Perfect conditions for outdoor activities.";
    case "Moderate":
      return "Air quality is acceptable. Sensitive individuals may experience minor symptoms.";
    case "Unhealthy for Sensitive Groups":
      return "Air quality is unhealthy for sensitive groups. Consider reducing outdoor activities.";
    case "Unhealthy":
      return "Air quality is unhealthy. Avoid outdoor activities and use air purifiers indoors.";
    case "Very Unhealthy":
      return "Air quality is very unhealthy. Stay indoors and use N-95 masks if going outside.";
    case "Hazardous":
      return "Air quality is hazardous. Stay indoors with air purifiers and avoid all outdoor activities.";
    default:
      return "Please stay at home or use N-95 mask for protection from air pollution.";
  }
};

export interface Position {
  row: number;
  col: number;
}

export const createMetrics = (
  data: any,
  standard: AQIStandardType,
  labels: string[],
  keys: string[],
  parameterKeys: string[],
  isOutdoor: boolean = false
): MetricData[] => {
  return labels.map((label, index) => {
    const dataKey = keys[index];
    const parameterKey = parameterKeys[index] as MetricType;
    const value = isOutdoor ? data?.[dataKey]?.v : data?.[dataKey];

    // Format the display value
    let displayValue = "--";
    if (value !== null && value !== undefined) {
      if (label === "Humidity") {
        displayValue = `${Math.round(value)}%`;
      } else if (label === "Temp") {
        displayValue = `${Math.round(value)}°C`;
      } else {
        displayValue = Math.round(value).toString();
      }
    }

    // Get colors using the correct parameter key for AQI range mapping
    const colorResult =
      value !== null && value !== undefined
        ? getColorForValue(value, parameterKey, standard)
        : { bgColor: "#f3f4f6", textColor: "#6b7280" };

    return {
      value: displayValue,
      label,
      bgColor: colorResult.bgColor,
      textColor: colorResult.textColor,
    };
  });
};

/**
 * Generates grid positions for triangular layout
 */
export const generatePositions = (
  cols: number,
  reverse: boolean = false
): Position[] => {
  return Array.from({ length: cols }).flatMap((_, r) =>
    Array.from({ length: cols - r }, (_, i) => ({
      row: r + 1,
      col: reverse ? i + 1 : r + i + 1,
    }))
  );
};

export const airQualityLevels = [
  { label: "GOOD", className: "mt-[-1.00px]" },
  {
    label: "MODERATE",
    className:
      "h-[15px] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:0] [-webkit-box-orient:vertical]",
  },
  { label: "Unhealthy for sensitive group", className: "h-8" },
  { label: "UNHEALTHY", className: "" },
  {
    label: "VERY UNHEALTHY",
    className:
      "h-[15px] whitespace-nowrap overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:0] [-webkit-box-orient:vertical]",
  },
  { label: "HAZARDOUS", className: "" },
];
