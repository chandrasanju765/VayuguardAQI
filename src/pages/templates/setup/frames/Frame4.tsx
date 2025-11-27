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
}: ComparisonFrameProps): React.JSX.Element => {

  const selectedAQIStandard = useAtomValue(selectedAQIStandardAtom);
  const { formattedTime, greeting } = useCurrentTime();

  // 1️⃣ Extract realtime values
  const realtimePMValues = useMemo(() => {
    const arr = realtimeAQIData?.indoor_air_quality;
    if (!arr) return { pm25: null, pm10: null };

    return {
      pm25: arr.find((x: any) => x.param === "pm2.5")?.value ?? null,
      pm10: arr.find((x: any) => x.param === "pm10.0")?.value ?? null,
    };
  }, [realtimeAQIData]);

  // 2️⃣ Fallback historical
  const historicalPM25 = aqiData?.indoor_avg?.["pm2.5"] ?? null;
  const historicalPM10 = aqiData?.indoor_avg?.["pm10.0"] ?? null;

  // 3️⃣ Final values (RAW PM values)
  const indoorPM25 = realtimePMValues.pm25 ?? historicalPM25;
  const indoorPM10 = realtimePMValues.pm10 ?? historicalPM10;

  // 4️⃣ Calculate AQI (used only for color & pointer)
  const indoorAQI_PM25 = useMemo(() => {
    if (indoorPM25 !== null)
      return calculateAQI(indoorPM25, undefined, undefined, undefined, selectedAQIStandard);
    return 0;
  }, [indoorPM25, selectedAQIStandard]);

  const indoorAQI_PM10 = useMemo(() => {
    if (indoorPM10 !== null)
      return calculateAQI(indoorPM10, undefined, undefined, undefined, selectedAQIStandard);
    return 0;
  }, [indoorPM10, selectedAQIStandard]);

  // 5️⃣ Colors & labels
  const indoorColor_PM25 = getColorForValue(indoorAQI_PM25, "aqi", selectedAQIStandard).bgColor;
  const indoorColor_PM10 = getColorForValue(indoorAQI_PM10, "aqi", selectedAQIStandard).bgColor;

  const label_PM25 = indoorAQI_PM25 > 0 ? getQualityLabel(indoorAQI_PM25, "aqi", selectedAQIStandard) : "No Data";
  const label_PM10 = indoorAQI_PM10 > 0 ? getQualityLabel(indoorAQI_PM10, "aqi", selectedAQIStandard) : "No Data";

  const scaleValues = ["50", "100", "200", "300", "400", "500"];

  const getIndicatorImage = (aqiValue: number) => {
    const val = Math.round(aqiValue);
    if (val < 50) return "/green-indicator.svg";
    if (val < 100) return "/yellow-indicator.svg";
    if (val < 150) return "/orange-indicator.svg";
    if (val < 200) return "/red-indicator.svg";
    if (val < 250) return "/pink-indicator.svg";
    return "/violet-indicator.svg";
  };

  return (
    <div className="bg-neutral-100 relative w-[900px] h-[500px]">

      {/* HEADER */}
      <div className="absolute top-4 right-4 z-20">
        <img src="/VG_logo.png" alt="VG Logo" className="h-8 w-auto" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow">Loading...</div>
        </div>
      )}

      {/* TOP SECTION */}
      <div className="w-full h-44 bg-[linear-gradient(90deg,rgba(132,250,222,0.65)_0%,rgba(143,211,244,0.65)_100%)] relative">
        <div className="h-full flex items-center pl-20">
          <p>
            {formattedTime}
            <br />
            <span className="font-bold">{greeting}</span>
          </p>
        </div>

        <img className="absolute w-[240px] bottom-0 right-20" src="/colorful-building.svg" />
      </div>

      {/* MAIN — RAW VALUES */}
      <div className="w-full flex items-center justify-center gap-10 mt-10">

        {/* LEFT PM2.5 */}
        <div>
          <div className="relative mx-auto w-fit gap-3 mb-4">

            {/* RAW VALUE HERE */}
            <p className="text-6xl font-bold" style={{ color: indoorColor_PM25 }}>
              {indoorPM25 !== null ? Math.round(indoorPM25) : "No Data"}
            </p>

            <p className="text-sm mt-1">
              PM 2.5 — {indoorPM25 !== null ? `${Math.round(indoorPM25)} μg/m³` : "No Data"}
            </p>

            <Badge className="absolute top-7 left-28 w-32 text-[10px]" style={{ color: indoorColor_PM25 }}>
              {label_PM25}
            </Badge>
          </div>

          {/* SCALE */}
          <div className="relative">
            <div className="w-80 h-6 rounded-2xl"
              style={{
                background:
                  "linear-gradient(90deg,#59B61F 0%,#EAAF01 16.66%,#EA8C34 33.32%,#E95478 50%,#B33FBA 66.64%,#A053F6 83.33%)",
              }} />

            <div className="absolute top-2 left-3.5 flex w-72 items-center justify-between text-[5px] font-semibold text-white">
              {scaleValues.map((v) => <div key={v}>{v}</div>)}
            </div>

            <img
              src={getIndicatorImage(indoorAQI_PM25)}
              className="absolute -top-0.5 w-3 object-contain"
              style={{ left: `${calculatePointerPosition(String(Math.round(indoorAQI_PM25)))}px` }}
            />
          </div>
        </div>

        <div className="h-40 w-1 bg-gray-300 rounded-xl" />

        {/* RIGHT PM10 */}
        <div>
          <div className="relative mx-auto w-fit gap-3 mb-4">

            {/* RAW VALUE HERE */}
            <p className="text-6xl font-bold" style={{ color: indoorColor_PM10 }}>
              {indoorPM10 !== null ? Math.round(indoorPM10) : "No Data"}
            </p>

            <p className="text-sm mt-1">
              PM 10.0 — {indoorPM10 !== null ? `${Math.round(indoorPM10)} μg/m³` : "No Data"}
            </p>

            <Badge className="absolute top-7 left-28 w-32 text-[10px]" style={{ color: indoorColor_PM10 }}>
              {label_PM10}
            </Badge>
          </div>

          {/* SCALE */}
          <div className="relative">
            <div className="w-80 h-6 rounded-2xl"
              style={{
                background:
                  "linear-gradient(90deg,#59B61F 0%,#EAAF01 16.66%,#EA8C34 33.32%,#E95478 50%,#B33FBA 66.64%,#A053F6 83.33%)",
              }} />

            <div className="absolute top-2 left-3.5 flex w-72 items-center justify-between text-[5px] font-semibold text-white">
              {scaleValues.map((v) => <div key={v}>{v}</div>)}
            </div>

            <img
              src={getIndicatorImage(indoorAQI_PM10)}
              className="absolute -top-0.5 w-3 object-contain"
              style={{ left: `${calculatePointerPosition(String(Math.round(indoorAQI_PM10)))}px` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

const Frame2 = (props: ComparisonFrameProps) => <ComparisonFrame {...props} />;

export default Frame2;
