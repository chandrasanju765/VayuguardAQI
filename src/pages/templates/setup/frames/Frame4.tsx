import React, { useMemo } from "react";
import { Badge } from "../../../../components/ui/badge";
import {
  calculatePointerPosition,
  getColorForValue,
  getQualityLabel,
} from "../utils";
import { calculateAQI } from "../../../history/utils";
import type { GetAQILogsHistoryByDeviceIDResponse } from "../../../../models/AQILogsHistory";
import { useAtomValue } from "jotai";
import { selectedAQIStandardAtom } from "../../../../atoms/aqiStandard";
import { useCurrentTime } from "../../../../hooks/useCurrentTime";
import type { AQICNGeoFeedData } from "../../../../types/aqicn";

interface ComparisonFrameProps {
  aqiData?: GetAQILogsHistoryByDeviceIDResponse["data"];
  realtimeAQIData?: any;
  isLoading?: boolean;
  error?: any;
  outdoorAQIData?: AQICNGeoFeedData | null;
  outdoorLoading?: boolean;
  outdoorError?: any;
}

export const ComparisonFrame = ({
  aqiData,
  realtimeAQIData,
  isLoading,
  error,
  outdoorAQIData,
  outdoorLoading = false,
  outdoorError,
}: ComparisonFrameProps): React.JSX.Element => {
  const selectedAQIStandard = useAtomValue(selectedAQIStandardAtom);
  const { formattedTime, greeting } = useCurrentTime();

  // Get real-time PM2.5 value only
  const realtimePM25 = useMemo(() => {
    if (!realtimeAQIData?.indoor_air_quality) {
      console.log("No indoor_air_quality found in real-time data");
      return null;
    }
    
    const pm25Param = realtimeAQIData.indoor_air_quality.find(
      (item: any) => item.param === "pm2.5"
    );
    
    console.log("Real-time PM2.5 parameter:", pm25Param);
    
    if (pm25Param) {
      console.log("Real-time PM2.5 value:", pm25Param.value);
      return pm25Param.value;
    }
    
    return null;
  }, [realtimeAQIData]);

  // Get historical PM2.5 as fallback
  const historicalPM25 = useMemo(() => {
    const pm25 = aqiData?.indoor_avg?.["pm2.5"] ?? null;
    console.log("Historical PM2.5 value:", pm25);
    return pm25;
  }, [aqiData]);

  // Use real-time PM2.5 first, then historical as fallback
  const currentPM25 = realtimePM25 ?? historicalPM25;

  console.log("=== PM2.5 VALUES ===");
  console.log("Real-time PM2.5:", realtimePM25);
  console.log("Historical PM2.5:", historicalPM25);
  console.log("Current PM2.5 (used for calculation):", currentPM25);

  // Calculate indoor AQI from the SAME PM2.5 value that we display
  const indoorAQI = useMemo(() => {
    if (currentPM25 !== null && currentPM25 !== undefined) {
      const calculatedAQI = calculateAQI(currentPM25, undefined, undefined, undefined, selectedAQIStandard);
      console.log("Calculated AQI from PM2.5:", currentPM25, "->", calculatedAQI);
      return calculatedAQI;
    }
    
    console.log("No PM2.5 data available for AQI calculation");
    return 0;
  }, [currentPM25, selectedAQIStandard]);

  // Get outdoor AQI directly from the API response
  const outdoorAQI = useMemo(() => {
    return outdoorAQIData?.aqi ?? 0;
  }, [outdoorAQIData]);

  // Get text colors based on AQI values and selected standard
  const indoorTextColor = useMemo(() => {
    if (indoorAQI > 0) {
      return getColorForValue(indoorAQI, "aqi", selectedAQIStandard).bgColor;
    }
    return "#6b7280"; // gray for no data
  }, [indoorAQI, selectedAQIStandard]);

  const outdoorTextColor = useMemo(() => {
    if (outdoorAQI > 0) {
      return getColorForValue(outdoorAQI, "aqi", selectedAQIStandard).bgColor;
    }
    return "#6b7280"; // gray for no data
  }, [outdoorAQI, selectedAQIStandard]);

  // Get quality labels based on AQI values and selected standard
  const indoorQualityLabel = useMemo(() => {
    if (indoorAQI > 0) {
      return getQualityLabel(indoorAQI, "aqi", selectedAQIStandard);
    }
    return "No Data";
  }, [indoorAQI, selectedAQIStandard]);

  const outdoorQualityLabel = useMemo(() => {
    if (outdoorAQI > 0) {
      return getQualityLabel(outdoorAQI, "aqi", selectedAQIStandard);
    }
    return "No Data";
  }, [outdoorAQI, selectedAQIStandard]);

  // Get PM2.5 value for display with unit - ROUNDED
  const indoorPM25Display = useMemo(() => {
    if (currentPM25 !== null && currentPM25 !== undefined) {
      return `${Math.round(currentPM25)} μg/m³`; // Rounded to nearest integer
    }
    return "No data";
  }, [currentPM25]);

  // Get outdoor PM2.5 value - ROUNDED
  const outdoorPM25Value = useMemo(() => {
    const pm25 = outdoorAQIData?.iaqi?.pm25?.v;
    if (pm25 !== null && pm25 !== undefined) {
      return Math.round(pm25); // Rounded to nearest integer
    }
    return null;
  }, [outdoorAQIData]);

  const outdoorPM25Display = useMemo(() => {
    if (outdoorPM25Value !== null) {
      return `${outdoorPM25Value} μg/m³`;
    }
    return "No data";
  }, [outdoorPM25Value]);

  const scaleValues = ["50", "100", "200", "300", "400", "500"];

  const getIndicatorImage = (aqiValue: string): string => {
    if (aqiValue === "--") return "/pointer.svg";

    const numericAQI = parseInt(aqiValue);

    if (numericAQI < 50) return "/green-indicator.svg";
    if (numericAQI < 100) return "/yellow-indicator.svg";
    if (numericAQI < 150) return "/orange-indicator.svg";
    if (numericAQI < 200) return "/red-indicator.svg";
    if (numericAQI < 250) return "/pink-indicator.svg";
    if (numericAQI < 300) return "/violet-indicator.svg";

    return "/violet-indicator.svg";
  };

  return (
    <div className="bg-neutral-100 relative w-[900px] h-[500px]">
      {/* Logo in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <img 
          src="/VG_logo.png" 
          alt="VG Logo" 
          className="h-8 w-auto" 
        />
      </div>

      {/* Loading State */}
      {(isLoading || outdoorLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-gray-700">
              {isLoading && outdoorLoading
                ? "Loading comparison data..."
                : isLoading
                ? "Loading indoor data..."
                : "Loading outdoor data..."}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {(error || outdoorError) && !isLoading && !outdoorLoading && (
        <div className="absolute top-16 left-6 right-6 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded z-10">
          <p className="text-sm">Error in loading data</p>
        </div>
      )}

      <div className="w-full h-44 bg-[linear-gradient(90deg,rgba(132,250,222,0.65)_0%,rgba(143,211,244,0.65)_100%)] relative">
        <div className="h-full flex items-center pl-20">
          <p>
            {formattedTime}
            <br />
            <span className="font-bold">{greeting}</span>
          </p>
        </div>

        <img
          className="absolute w-[240px] bottom-0 right-20"
          alt="City skyline pana"
          src="/colorful-building.svg"
        />
      </div>

      <div className="w-full flex items-center justify-center gap-10 mt-10">
        {/* INDOOR - PM2.5 Only */}
        <div>
          <div className="relative mx-auto w-fit gap-3 mb-4">
            <p
              className="text-6xl font-bold gap-4"
              style={{ color: indoorTextColor }}
            >
              {indoorAQI > 0 ? Math.round(indoorAQI) : "--"} {/* Rounded AQI */}
            </p>
            <p className="max-w-40 text-sm mt-1">
              PM 2.5 - {indoorPM25Display}
            </p>
            <Badge
              className="top-7 left-28 absolute w-32 text-[10px]"
              style={{ color: indoorTextColor }}
            >
              {indoorQualityLabel}
            </Badge>
          </div>

          <div className="relative">
            <div
              className="w-80 h-6 rounded-2xl"
              style={{
                background:
                  "linear-gradient(90deg, #59B61F 0%, #EAAF01 16.66%, #EA8C34 33.32%, #E95478 50%, #B33FBA 66.64%, #A053F6 83.33%)",
              }}
            />
            <div className="flex w-72 h-2 items-center justify-between absolute top-2 left-3.5 z-10">
              {scaleValues.map((value, scaleIndex) => (
                <div
                  key={scaleIndex}
                  className="font-semibold text-white text-[5.1px]"
                >
                  {value}
                </div>
              ))}
            </div>

            <img
              src={getIndicatorImage(
                indoorAQI > 0 ? Math.round(indoorAQI).toString() : "--" // Rounded AQI for pointer
              )}
              className="absolute -top-0.5 w-3 object-contain"
              style={{
                left: `${calculatePointerPosition(
                  indoorAQI > 0 ? Math.round(indoorAQI).toString() : "--" // Rounded AQI for pointer position
                )}px`,
              }}
            />
          </div>
        </div>

        <div className="h-40 w-1 bg-gray-300 rounded-xl" />

        {/* OUTDOOR - PM2.5 Only */}
        <div>
          <div className="relative mx-auto w-fit gap-3 mb-4">
            <p
              className="text-6xl font-bold gap-4"
              style={{ color: outdoorTextColor }}
            >
              {outdoorAQI > 0 ? Math.round(outdoorAQI) : "--"} {/* Rounded AQI */}
            </p>
            <p className="max-w-40 text-sm mt-1">
              PM 2.5 - {outdoorPM25Display}
            </p>
            <Badge
              className="top-7 left-28 absolute w-32 text-[10px]"
              style={{ color: outdoorTextColor }}
            >
              {outdoorQualityLabel}
            </Badge>
          </div>

          <div className="relative">
            <div
              className="w-80 h-6 rounded-2xl"
              style={{
                background:
                  "linear-gradient(90deg, #59B61F 0%, #EAAF01 16.66%, #EA8C34 33.32%, #E95478 50%, #B33FBA 66.64%, #A053F6 83.33%)",
              }}
            />
            <div className="flex w-72 h-2 items-center justify-between absolute top-2 left-3.5 z-10">
              {scaleValues.map((value, scaleIndex) => (
                <div
                  key={scaleIndex}
                  className="font-semibold text-white text-[5.1px]"
                >
                  {value}
                </div>
              ))}
            </div>

            <img
              src={getIndicatorImage(
                outdoorAQI > 0 ? Math.round(outdoorAQI).toString() : "--" // Rounded AQI for pointer
              )}
              className="absolute -top-0.5 w-3 object-contain"
              style={{
                left: `${calculatePointerPosition(
                  outdoorAQI > 0 ? Math.round(outdoorAQI).toString() : "--" // Rounded AQI for pointer position
                )}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Frame2 = (props: ComparisonFrameProps) => {
  return <ComparisonFrame {...props} />;
};

export default Frame2;