import { Cell, PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "../../components/ui/card";
import type { JSX } from "react";
import type { Averages } from "../../models/AQILogsHistory";
import { useAtomValue, useAtom } from "jotai";
import {
  currentRangeMappingAtom,
  getColorForValue,
} from "../../atoms/aqiStandard";
import { useMemo } from "react";
import { selectedMetricAtom, type SelectedMetricType } from "./jotai";
import { calculateAQI, getAQIQualityInfo } from "./utils";
import { selectedAQIStandardAtom } from "../../atoms/aqiStandard";

interface MetricConfig {
  key: keyof Averages;
  label: string;
  unit: string;
}

const METRICS_CONFIG: MetricConfig[] = [
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "temp", label: "Temperature", unit: "°C" },
  { key: "pm2.5", label: "PM 2.5", unit: "µg/m³" },
  { key: "pm10.0", label: "PM 10.0", unit: "µg/m³" },
  { key: "co2", label: "CO2", unit: "ppm" },
  { key: "tvoc", label: "TVOC", unit: "µg/m³" },
  { key: "hcho", label: "HCHO", unit: "µg/m³" },
];

const AQIAveragesPieCharts = ({
  indoorAverages,
  outdoorAverages,
}: {
  indoorAverages?: Averages;
  outdoorAverages?: Averages;
}): JSX.Element => {
  const currentRangeMapping = useAtomValue(currentRangeMappingAtom);
  const [selectedMetric, setSelectedMetric] = useAtom(selectedMetricAtom);
  const selectedStandard = useAtomValue(selectedAQIStandardAtom);

  // Calculate AQI for indoor and outdoor
  const aqiData = useMemo(() => {
    const indoorAQI = calculateAQI(
      indoorAverages?.["pm2.5"],
      indoorAverages?.["pm10.0"],
      indoorAverages?.tvoc,
      indoorAverages?.hcho,
      selectedStandard
    );
    const outdoorAQI = calculateAQI(
      outdoorAverages?.["pm2.5"],
      outdoorAverages?.["pm10.0"],
      undefined,
      undefined,
      selectedStandard
    );

    const indoorInfo = getAQIQualityInfo(indoorAQI, currentRangeMapping);
    const outdoorInfo = getAQIQualityInfo(outdoorAQI, currentRangeMapping);

    return {
      indoor: { aqi: indoorAQI, ...indoorInfo },
      outdoor: { aqi: outdoorAQI, ...outdoorInfo },
    };
  }, [indoorAverages, outdoorAverages, currentRangeMapping, selectedStandard]);

  // Helper function to get color based on value and AQI standard mapping
  const getValueColor = (value: number, parameter: string): string => {
    return getColorForValue(value, parameter, currentRangeMapping);
  };

  // Helper function to create chart data for a metric
  const createChartData = (
    config: MetricConfig,
    indoorValue?: number,
    outdoorValue?: number
  ) => {
    const indoorColor =
      indoorValue !== undefined && indoorValue !== null
        ? getValueColor(indoorValue, config.key)
        : "#9ca3af"; // Gray color for undefined values
    const outdoorColor =
      outdoorValue !== undefined && outdoorValue !== null
        ? getValueColor(outdoorValue, config.key)
        : "#9ca3af"; // Gray color for undefined values

    return {
      indoor: {
        name: "Indoor",
        value: indoorValue,
        color: indoorColor,
        unit: config.unit,
      },
      outdoor: {
        name: "Outdoor",
        value: outdoorValue,
        color: outdoorColor,
        unit: config.unit,
      },
    };
  };

  const SinglePieChart = ({
    data,
    label,
  }: {
    data: { value: number | undefined; color: string; unit: string };
    label: string;
  }) => {
    const actualValue = data.value ?? 0;
    const chartData = [
      { value: actualValue, fill: data.color },
      { value: Math.max(100 - actualValue, 0), fill: "#eaeaea" },
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-[#7c7c7c] mb-2 text-center">
          {label}
        </div>
        <div className="w-[74px] h-[74px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={37}
                startAngle={90}
                endAngle={450}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-center" style={{ color: data.color }}>
              {data.value !== undefined && data.value !== null ? (
                <>
                  <span className="font-bold">{data.value.toFixed(1)}</span>
                  <br />
                  <span className="text-gray-400">{data.unit}</span>
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{`${data.name}: ${data.value}${data.unit}`}</p>
        </div>
      );
    }
    return null;
  };

  const AQISinglePieChart = ({
    data,
    label,
  }: {
    data: { aqi: number; quality: string; color: string };
    label: string;
  }) => {
    // Create chart data - AQI scale goes up to 500, but we'll cap display at 300 for visual purposes
    const maxScale = 300;
    const normalizedValue = Math.min(data.aqi, maxScale);
    const chartData = [
      { value: normalizedValue, fill: data.color },
      { value: maxScale - normalizedValue, fill: "#eaeaea" },
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-[#7c7c7c] mb-2 text-center">
          {label}
        </div>
        <div className="w-[74px] h-[74px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={32}
                startAngle={90}
                endAngle={450}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                        <p className="text-sm font-medium">{`AQI: ${data.aqi}`}</p>
                        <p className="text-xs">{data.quality}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-xs font-bold text-center leading-tight"
              style={{ color: data.color }}
            >
              {data.aqi}
            </span>
            <span className="text-[10px] text-gray-600 text-center leading-tight">
              AQI
            </span>
          </div>
        </div>
      </div>
    );
  };

  const AQIMetricGroup = () => {
    const isSelected = selectedMetric === "aqi";

    return (
      <Card
        className={`flex-1 min-w-[200px] bg-neutral-50 border-[0.62px] rounded-[7.5px] cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-[#0000001a] hover:border-gray-300"
        }`}
        onClick={() => setSelectedMetric("aqi")}
      >
        <CardContent className="flex flex-col items-center gap-3 p-4">
          <div
            className={`font-medium text-base tracking-[-0.96px] leading-[19.2px] text-center ${
              isSelected ? "text-blue-700" : "text-[#7c7c7c]"
            }`}
          >
            Air Quality Index (AQI)
          </div>
          <div className="flex items-center justify-center gap-6 w-full">
            <AQISinglePieChart data={aqiData.indoor} label="Indoor" />
            <AQISinglePieChart data={aqiData.outdoor} label="Outdoor" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const MetricGroup = ({
    config,
    indoorValue,
    outdoorValue,
  }: {
    config: MetricConfig;
    indoorValue?: number;
    outdoorValue?: number;
  }) => {
    const chartData = createChartData(config, indoorValue, outdoorValue);
    const isSelected = selectedMetric === config.key;

    const handleClick = () => {
      setSelectedMetric(config.key as SelectedMetricType);
    };

    return (
      <Card
        className={`flex-1 min-w-[200px] bg-neutral-50 border-[0.62px] rounded-[7.5px] cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-[#0000001a] hover:border-gray-300"
        }`}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center gap-3 p-4">
          <div
            className={`font-medium text-base tracking-[-0.96px] leading-[19.2px] text-center ${
              isSelected ? "text-blue-700" : "text-[#7c7c7c]"
            }`}
          >
            {config.label}
          </div>
          <div className="flex items-center justify-center gap-6 w-full">
            <SinglePieChart data={chartData.indoor} label="Indoor" />
            <SinglePieChart data={chartData.outdoor} label="Outdoor" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full px-6 mb-4">
      {/* First row - AQI + 3 metrics */}
      <div className="flex items-start gap-4">
        <AQIMetricGroup />
        {METRICS_CONFIG.slice(0, 3).map((config) => (
          <MetricGroup
            key={config.key}
            config={config}
            indoorValue={indoorAverages?.[config.key]}
            outdoorValue={outdoorAverages?.[config.key]}
          />
        ))}
      </div>

      {/* Second row - 4 metrics */}
      <div className="flex items-start gap-4">
        {METRICS_CONFIG.slice(3, 7).map((config) => (
          <MetricGroup
            key={config.key}
            config={config}
            indoorValue={indoorAverages?.[config.key]}
            outdoorValue={outdoorAverages?.[config.key]}
          />
        ))}
      </div>
    </div>
  );
};

export default AQIAveragesPieCharts;
