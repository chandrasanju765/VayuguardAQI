import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent } from "../../components/ui/card";
import type { JSX } from "react";

import { useMemo } from "react";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import {
  currentRangeMappingAtom,
  getColorForValue,
  selectedAQIStandardAtom,
} from "../../atoms/aqiStandard";
import { selectedMetricAtom, selectedPeriodAtom } from "./jotai";
import { useAQIDataForSelectedDevice } from "../../hooks/useAQIDataForSelectedDevice";
import {
  HOURS_IN_DAY,
  DAYS_IN_WEEK,
  MONTHS_IN_YEAR,
  CHART_CONFIG,
  formatTime,
  getWeekdayName,
  getMonthName,
  roundToDecimals,
  getMetricConfig,
} from "./utils";
import type { ChartDataPoint, MetricConfiguration } from "./utils";

const HistoryBarChart = (): JSX.Element => {
  const aqiLogsHistory = useAQIDataForSelectedDevice();
  const currentRangeMapping = useAtomValue(currentRangeMappingAtom);
  const selectedMetric = useAtomValue(selectedMetricAtom);
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const selectedStandard = useAtomValue(selectedAQIStandardAtom);

  const metricConfig: MetricConfiguration = useMemo(() => {
    return getMetricConfig(selectedMetric, selectedStandard);
  }, [selectedMetric, selectedStandard]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!aqiLogsHistory?.data?.data || aqiLogsHistory.data.data.length === 0) {
      return [];
    }
    if (selectedPeriod === "week") {
      const weeklyData = new Map<
        number,
        { values: number[]; timestamp: string }
      >();

      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        weeklyData.set(day, { values: [], timestamp: "" });
      }

      aqiLogsHistory.data.data.forEach((log) => {
        const timestamp = dayjs(log.timestamp);
        const dayOfWeekJS = timestamp.day(); // 0 = Sunday, 1 = Monday, etc.
        const dayOfWeek = dayOfWeekJS === 0 ? 6 : dayOfWeekJS - 1; // Convert to 0 = Monday
        const metricValue = metricConfig.getValue(log);

        const dayData = weeklyData.get(dayOfWeek);
        if (dayData) {
          dayData.values.push(metricValue);
          if (!dayData.timestamp) {
            dayData.timestamp = log.timestamp;
          }
        }
      });

      // Convert to array format with averages
      const processedData = Array.from(weeklyData.entries()).map(
        ([day, data]) => {
          const averageValue =
            data.values.length > 0
              ? data.values.reduce((sum, val) => sum + val, 0) /
                data.values.length
              : 0;

          return {
            time: getWeekdayName(day),
            value: roundToDecimals(averageValue),
            dayOfWeek: day,
            entryCount: data.values.length,
            fullTimestamp: data.timestamp || new Date().toISOString(),
            color: getColorForValue(
              averageValue,
              metricConfig.param,
              currentRangeMapping
            ),
          };
        }
      );

      return processedData.sort(
        (a, b) => (a.dayOfWeek || 0) - (b.dayOfWeek || 0)
      );
    } else if (selectedPeriod === "month") {
      const firstLog = aqiLogsHistory.data.data[0];
      const firstTimestamp = dayjs(firstLog.timestamp);
      const year = firstTimestamp.year();
      const month = firstTimestamp.month();
      const daysInMonth = firstTimestamp.daysInMonth();

      const monthlyData = new Map<
        number,
        { values: number[]; timestamp: string }
      >();

      // Initialize all days of the month (1 to daysInMonth)
      for (let day = 1; day <= daysInMonth; day++) {
        monthlyData.set(day, { values: [], timestamp: "" });
      }

      // Process each log entry to extract metric data and group by day of month
      aqiLogsHistory.data.data.forEach((log) => {
        const timestamp = dayjs(log.timestamp);
        if (timestamp.year() === year && timestamp.month() === month) {
          const dayOfMonth = timestamp.date(); // 1-indexed
          const metricValue = metricConfig.getValue(log);

          const dayData = monthlyData.get(dayOfMonth);
          if (dayData) {
            dayData.values.push(metricValue);
            if (!dayData.timestamp) {
              dayData.timestamp = log.timestamp;
            }
          }
        }
      });

      // Convert to array format with averages
      const processedData = Array.from(monthlyData.entries()).map(
        ([day, data]) => {
          const averageValue =
            data.values.length > 0
              ? data.values.reduce((sum, val) => sum + val, 0) /
                data.values.length
              : 0;

          return {
            time: day.toString().padStart(2, "0"),
            value: roundToDecimals(averageValue),
            dayOfMonth: day,
            entryCount: data.values.length,
            fullTimestamp: data.timestamp || new Date().toISOString(),
            color: getColorForValue(
              averageValue,
              metricConfig.param,
              currentRangeMapping
            ),
          };
        }
      );

      return processedData.sort(
        (a, b) => (a.dayOfMonth || 0) - (b.dayOfMonth || 0)
      );
    } else if (selectedPeriod === "year") {
      const firstLog = aqiLogsHistory.data.data[0];
      const firstTimestamp = dayjs(firstLog.timestamp);
      const year = firstTimestamp.year();

      const yearlyData = new Map<
        number,
        { values: number[]; timestamp: string }
      >();

      // Initialize all 12 months (0 = January, 11 = December)
      for (let month = 0; month < MONTHS_IN_YEAR; month++) {
        yearlyData.set(month, { values: [], timestamp: "" });
      }

      // Process each log entry to extract metric data and group by month
      aqiLogsHistory.data.data.forEach((log) => {
        const timestamp = dayjs(log.timestamp);
        if (timestamp.year() === year) {
          const monthOfYear = timestamp.month(); // 0-indexed (0 = January)
          const metricValue = metricConfig.getValue(log);

          const monthData = yearlyData.get(monthOfYear);
          if (monthData) {
            monthData.values.push(metricValue);
            if (!monthData.timestamp) {
              monthData.timestamp = log.timestamp;
            }
          }
        }
      });

      // Convert to array format with averages
      const processedData = Array.from(yearlyData.entries()).map(
        ([month, data]) => {
          const averageValue =
            data.values.length > 0
              ? data.values.reduce((sum, val) => sum + val, 0) /
                data.values.length
              : 0;

          return {
            time: getMonthName(month, year),
            value: roundToDecimals(averageValue),
            monthOfYear: month,
            entryCount: data.values.length,
            fullTimestamp: data.timestamp || new Date().toISOString(),
            color: getColorForValue(
              averageValue,
              metricConfig.param,
              currentRangeMapping
            ),
          };
        }
      );

      return processedData.sort(
        (a, b) => (a.monthOfYear || 0) - (b.monthOfYear || 0)
      );
    } else {
      const hourlyData = new Map<
        number,
        { values: number[]; timestamp: string }
      >();

      for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
        hourlyData.set(hour, { values: [], timestamp: "" });
      }

      // Process each log entry to extract metric data and group by hour
      aqiLogsHistory.data.data.forEach((log) => {
        const timestamp = dayjs(log.timestamp);
        const hour = timestamp.hour();
        const metricValue = metricConfig.getValue(log);

        const hourData = hourlyData.get(hour);
        if (hourData) {
          hourData.values.push(metricValue);
          if (!hourData.timestamp) {
            hourData.timestamp = log.timestamp;
          }
        }
      });

      // Convert to array format with averages
      const processedData = Array.from(hourlyData.entries()).map(
        ([hour, data]) => {
          const averageValue =
            data.values.length > 0
              ? data.values.reduce((sum, val) => sum + val, 0) /
                data.values.length
              : 0;

          return {
            time: formatTime(hour),
            value: roundToDecimals(averageValue),
            hour,
            entryCount: data.values.length,
            fullTimestamp: data.timestamp || new Date().toISOString(),
            color: getColorForValue(
              averageValue,
              metricConfig.param,
              currentRangeMapping
            ),
          };
        }
      );

      return processedData.sort((a, b) => (a.hour || 0) - (b.hour || 0));
    }
  }, [aqiLogsHistory, currentRangeMapping, metricConfig, selectedPeriod]);

  // Empty state component
  const EmptyState = () => (
    <Card className="w-full bg-neutral-50 rounded-[7.5px] border-[0.62px] border-[#0000001a]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between w-full mb-4">
          <div className="w-[138px] h-8 flex items-center [font-family:'Inter',Helvetica] font-normal text-[#1c1c1c] text-base text-center tracking-[0] leading-6">
            {metricConfig.label}
          </div>
        </div>
        <div className="h-[425px] w-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">
            No {metricConfig.label.toLowerCase()} data available for the
            selected{" "}
            {selectedPeriod === "day"
              ? "day"
              : selectedPeriod === "week"
              ? "week"
              : selectedPeriod === "month"
              ? "month"
              : "year"}
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Show message when no data is available
  if (chartData.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="w-full bg-neutral-50 rounded-[7.5px] border-[0.62px] border-[#0000001a]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between w-full mb-4">
          <div className="w-[138px] h-8 flex items-center [font-family:'Inter',Helvetica] font-normal text-[#1c1c1c] text-base text-center tracking-[0] leading-6">
            {metricConfig.label}
          </div>
        </div>

        <div className="h-[425px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={CHART_CONFIG.padding}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#6b7280",
                    fontFamily: "Inter, Helvetica",
                  }}
                  interval={0}
                  tickFormatter={(value: string) => {
                    if (selectedPeriod === "week") {
                      // For weekly view, show abbreviated day names
                      return value.substring(0, 3); // Mon, Tue, Wed, etc.
                    } else if (selectedPeriod === "month") {
                      // For monthly view, show all day numbers
                      return value; // "01", "02", ...
                    } else if (selectedPeriod === "year") {
                      // For yearly view, show all month names with year
                      return value; // "Jan 2025", "Feb 2025", etc.
                    } else {
                      // For daily view, show every 2nd hour to avoid crowding
                      const hour = parseInt(value.split(":")[0]);
                      return hour % 2 === 0 ? value : "";
                    }
                  }}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                  label={{
                    value: metricConfig.unit,
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#6B7280",
                      fontSize: 12,
                    },
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload as ChartDataPoint;
                      const ranges = currentRangeMapping[metricConfig.param];
                      const range = ranges?.find(
                        (r: any) => data.value >= r.min && data.value <= r.max
                      );

                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-medium text-gray-900">
                            {selectedPeriod === "week"
                              ? getWeekdayName(data.dayOfWeek || 0)
                              : selectedPeriod === "month"
                              ? `Day ${label}`
                              : selectedPeriod === "year"
                              ? label
                              : formatTime(
                                  new Date(data.fullTimestamp).getTime()
                                )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {metricConfig.param}: {data.value}{" "}
                            {metricConfig.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Readings: {data.entryCount}
                          </p>
                          {range && (
                            <p
                              className="text-sm font-medium"
                              style={{ color: range.bgColor }}
                            >
                              {range.label || "Quality Level"}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No data available</p>
                <p className="text-gray-400 text-sm">
                  There is no AQI data for the selected{" "}
                  {selectedPeriod === "day"
                    ? "day"
                    : selectedPeriod === "week"
                    ? "week"
                    : selectedPeriod === "month"
                    ? "month"
                    : "year"}
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryBarChart;
