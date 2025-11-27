import React, { useMemo } from "react";
import { useAtomValue } from "jotai";
import type { GetAQILogsHistoryByDeviceIDResponse } from "../../../../models/AQILogsHistory";
import { selectedAQIStandardAtom } from "../../../../atoms/aqiStandard";
import { airQualityLevels, createMetrics, generatePositions } from "../utils";
import type { AQICNGeoFeedData } from "../../../../types/aqicn";

interface ComparisonScaleFrameProps {
  aqiData?: GetAQILogsHistoryByDeviceIDResponse["data"];
  realtimeAQIData?: any; // <-- We use this ONLY for indoor
  isLoading?: boolean;
  error?: any;
  outdoorAQIData?: AQICNGeoFeedData | null; // <-- untouched
  outdoorLoading?: boolean;
  outdoorError?: any;
}

export const ComparisonScaleFrame = ({
  // aqiData,
  realtimeAQIData,
  isLoading,
  error,
  outdoorAQIData,
  outdoorLoading = false,
  outdoorError,
}: ComparisonScaleFrameProps): React.JSX.Element => {
  const selectedStandard = useAtomValue(selectedAQIStandardAtom);

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // ⭐ INDOOR MUST ALWAYS COME FROM REALTIME ONLY
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const indoorMetrics = useMemo(() => {
    const labels = ["PM 2.5", "PM 10.0", "TVOC", "Temperature", "Humidity", "CO2"];
    const dataKeys = ["pm2.5", "pm10.0", "tvoc", "temp", "humidity", "co2"];
    const parameterKeys = ["pm2.5", "pm10.0", "tvoc", "temp", "humidity", "co2"];

    // ---- REALTIME ONLY (exact same logic as Frame 1)
    const indoorLiveData = formatRealtimeIndoor(realtimeAQIData?.indoor_air_quality);

    return createMetrics(
      indoorLiveData,
      selectedStandard,
      labels,
      dataKeys,
      parameterKeys
    );
  }, [realtimeAQIData, selectedStandard]);

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // ⭐ OUTDOOR – DO NOT TOUCH THIS
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const outdoorMetrics = useMemo(() => {
    const labels = ["PM 2.5", "PM 10.0", "TVOC", "Temperature", "Humidity", "CO2"];
    const dataKeys = ["pm25", "pm10", "tvoc", "t", "h", "co2"];
    const parameterKeys = ["pm2.5", "pm10.0", "tvoc", "temp", "humidity", "co2"];

    return outdoorAQIData?.iaqi
      ? createMetrics(
          outdoorAQIData.iaqi,
          selectedStandard,
          labels,
          dataKeys,
          parameterKeys,
          true
        )
      : createMetrics({}, selectedStandard, labels, dataKeys, parameterKeys, true);
  }, [outdoorAQIData, selectedStandard]);

  const cols = 3;

  const indoorPositions = generatePositions(cols);
  const outdoorPositions = generatePositions(cols, true);

  return (
    <div className="bg-neutral-100 p-12 relative w-[900px] h-[500px]">
      {/* Logo */}
      <div className="absolute top-4 right-4 z-20">
        <img src="/VG_logo.png" alt="VG Logo" className="h-8 w-auto" />
      </div>

      {/* Loading */}
      {(isLoading || outdoorLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-gray-700">Loading comparison data...</p>
          </div>
        </div>
      )}

      {/* Errors */}
      {(error || outdoorError) && !isLoading && !outdoorLoading && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded z-10">
          <p className="text-sm">
            Error loading data:{" "}
            {error?.message || outdoorError?.message || "Unknown error"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-7 w-full h-full">
        {/* INDOOR */}
        <div>
          <h1 className="font-bold text-2xl uppercase text-center mb-10">
            Indoor
          </h1>

          <div className="grid grid-cols-3 gap-6">
            {indoorMetrics.map((metric, index) => {
              const { row, col } = indoorPositions[index];
              return (
                <div
                  key={`indoor-metric-${index}`}
                  style={{
                    gridRowStart: row,
                    gridColumnStart: col,
                    backgroundColor: metric.bgColor,
                    color: metric.textColor,
                  }}
                  className="flex flex-col w-20 h-20 items-center justify-center gap-0.5 rounded-full shadow"
                >
                  <div className="font-medium text-base text-center">
                    {metric.value}
                  </div>
                  <div className="font-medium opacity-75 text-xs text-center">
                    {metric.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AQI Scale */}
        <div
          className="w-28 h-96 mx-auto rounded-full flex flex-col justify-between py-6 px-2"
          style={{
            background:
              "linear-gradient(0deg, #A053F6 0%, #B33FBA 16.66%, #E95478 33.32%, #EA8C34 50%, #EAAF01 66.64%, #59B61F 83.33%)",
          }}
        >
          {airQualityLevels.map((level, index) => (
            <div key={index} className="text-xs text-center text-white">
              {level.label}
            </div>
          ))}
        </div>

        {/* OUTDOOR */}
        <div>
          <h1 className="font-bold text-2xl uppercase text-center mb-10">
            Outdoor
          </h1>

          <div className="grid grid-cols-3 gap-6">
            {outdoorMetrics.map((metric, index) => {
              const { row, col } = outdoorPositions[index];
              return (
                <div
                  key={`outdoor-metric-${index}`}
                  style={{
                    gridRowStart: row,
                    gridColumnStart: col,
                    backgroundColor: metric.bgColor,
                    color: metric.textColor,
                  }}
                  className="flex flex-col w-20 h-20 items-center justify-center gap-0.5 rounded-full shadow"
                >
                  <div className="font-medium text-base text-center">
                    {metric.value}
                  </div>
                  <div className="font-medium opacity-75 text-xs text-center">
                    {metric.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ⭐ EXACT SAME REALTIME FORMATTER AS FRAME 1
const formatRealtimeIndoor = (arr: any[]): Record<string, number> => {
  const obj: Record<string, number> = {};

  if (!Array.isArray(arr)) return obj;

  arr.forEach((item) => {
    const key = item.param || item.parameter;
    if (key && (typeof item.value === "number" || item.value === 0)) {
      obj[key] = item.value;
    }
  });

  return obj;
};

const Frame3 = (props: ComparisonScaleFrameProps) => {
  return <ComparisonScaleFrame {...props} />;
};

export default Frame3;
