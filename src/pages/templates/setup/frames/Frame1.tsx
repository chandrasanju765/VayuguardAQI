import { CircleIcon } from "lucide-react";
import {
  calculateDynamicEnvironmentalMetrics,
  calculateAQIInfo,
  getAQITailwindClasses,
  getBuildingImage,
  getBoyImage,
  getAQIDisclaimerMessage,
} from "../utils";
import { useMemo } from "react";
import type { GetAQILogsHistoryByDeviceIDResponse } from "../../../../models/AQILogsHistory";
import { cn } from "../../../../lib/utils";
import { useAtom } from "jotai";
import { selectedAQIStandardAtom } from "../../../../atoms/aqiStandard";

interface IndoorAQIFrameProps {
  aqiData?: GetAQILogsHistoryByDeviceIDResponse["data"];
  isLoading?: boolean;
}

const IndoorAQIFrame = ({ aqiData, isLoading }: IndoorAQIFrameProps) => {
  const [selectedStandard] = useAtom(selectedAQIStandardAtom);

  const dynamicEnvironmentalMetrics = useMemo(() => {
    const indoorData = aqiData?.indoor_avg;
    return calculateDynamicEnvironmentalMetrics(indoorData);
  }, [aqiData]);

  const aqiInfo = useMemo(() => {
    const indoorData = aqiData?.indoor_avg;
    return calculateAQIInfo(indoorData, selectedStandard);
  }, [aqiData, selectedStandard]);

  const aqiTailwindClasses = useMemo(() => {
    return getAQITailwindClasses(aqiInfo.aqi, selectedStandard);
  }, [aqiInfo.aqi, selectedStandard]);

  const buildingImage = useMemo(() => {
    return getBuildingImage(aqiInfo.aqi, selectedStandard);
  }, [aqiInfo.aqi, selectedStandard]);

  const boyImage = useMemo(() => {
    return getBoyImage(aqiInfo.aqi, selectedStandard);
  }, [aqiInfo.aqi, selectedStandard]);

  return (
    <div
      className={cn(
        "w-[900px] h-[500px] bg-gradient-to-b from-gray-100 overflow-hidden shadow-2xl p-4 relative",
        aqiTailwindClasses.gradient
      )}
    >
      {/* Logo in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <img 
          src="/VG_logo.png" 
          alt="VG Logo" 
          className="h-8 w-auto" 
        />
      </div>

      <h1 className="text-center text-2xl font-semibold mt-4">Indoor</h1>

      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-gray-700">Loading outdoor data...</p>
          </div>
        </div>
      )}

      <div className="w-full grid grid-cols-4 mt-4">
        {dynamicEnvironmentalMetrics.slice(0, 4).map((metric, index) => (
          <div
            key={index}
            className={cn(
              "w-[170px] flex items-center justify-between gap-1 p-2 rounded-xl h-fit"
            )}
            style={{
              border: `4px solid ${metric.textColor}`,
            }}
          >
            <img
              src={metric.icon}
              alt={metric.alt}
              className="w-10 max-h-10 object-contain"
            />
            <div className="flex flex-col items-start gap-[5px]">
              <div className="text-gray-700">{metric.label}</div>
              <div
                className="text-xl font-semibold"
                style={{ color: metric.textColor }}
              >
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 mt-4">
        {dynamicEnvironmentalMetrics.slice(4, 5).map((metric, index) => (
          <div
            key={index}
            className={cn(
              "w-[170px] flex items-center justify-between gap-1 p-2 rounded-xl h-fit"
            )}
            style={{
              border: `4px solid ${metric.textColor}`,
            }}
          >
            <img src={metric.icon} alt={metric.alt} className="w-10" />
            <div className="flex flex-col items-start gap-[5px]">
              <div className="text-gray-700">{metric.label}</div>
              <div
                className="text-xl font-semibold"
                style={{ color: metric.textColor }}
              >
                {metric.value}
              </div>
            </div>
          </div>
        ))}

        <div className="col-span-2 relative">
          <div
            className="w-3 h-60 rounded-lg mx-auto border-[1px] border-gray-900 relative z-10"
            style={{
              background:
                "linear-gradient(0deg, #A053F6 0%, #B33FBA 16.66%, #E95478 33.32%, #EA8C34 50%, #EAAF01 66.64%, #59B61F 83.33%)",
            }}
            aria-hidden="true"
          >
            <CircleIcon
              className={cn(
                "w-4 h-4 rounded-full absolute left-[50%] right-[0%] translate-x-[-50%]",
                aqiTailwindClasses.meter
              )}
              stroke="#fff"
              strokeWidth={8}
              fill="none"
            />
          </div>

          <div className="absolute right-0 top-12 flex flex-col justify-between z-10">
            <div>
              <div className="flex gap-2">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex justify-center items-center",
                    aqiTailwindClasses.bg
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      aqiTailwindClasses.dot
                    )}
                  ></div>
                </div>
                <p className="text-sm font-medium">LIVE AQI</p>
              </div>
              <p className="text-6xl font-semibold mt-2">{aqiInfo.aqi}</p>
            </div>

            <div className="font-medium mt-6">
              <p>Air Quality is</p>
              <div
                className="text-xs font-semibold px-3 py-0.5 w-fit rounded mt-1 text-wrap max-w-[150px]"
                style={{
                  backgroundColor: aqiInfo.colors.bgColor,
                  color: aqiInfo.colors.textColor,
                }}
              >
                {aqiInfo.quality}
              </div>
            </div>
          </div>
        </div>

        {dynamicEnvironmentalMetrics.slice(5, 6).map((metric, index) => (
          <div
            key={index}
            className={cn(
              "w-[170px] flex items-center justify-between gap-1 p-2 rounded-xl h-fit"
            )}
            style={{
              border: `4px solid ${metric.textColor}`,
            }}
          >
            <img src={metric.icon} alt={metric.alt} className="w-10" />
            <div className="flex flex-col items-start gap-[5px]">
              <div className="text-gray-700">{metric.label}</div>
              <div
                className="text-xl font-semibold"
                style={{ color: metric.textColor }}
              >
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="z-10 relative ml-6 mt-10">
        * {getAQIDisclaimerMessage(aqiInfo.aqi, selectedStandard)}
      </p>

      <img
        src={boyImage}
        alt="Outdoor Air Quality"
        className="absolute bottom-4 right-20 z-10 object-contain h-52"
      />
      <img
        src={buildingImage}
        alt="Building"
        className="absolute bottom-0 left-16"
      />
      <img
        src="/building-shadow.svg"
        alt="Building Shadow"
        className="absolute bottom-0 right-0"
      />
      <img
        src="/building-shadow.svg"
        alt="Building Shadow"
        className="absolute bottom-0 -left-[122px]"
      />
    </div>
  );
};

export default IndoorAQIFrame;