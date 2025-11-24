import type {
  AirQualityParameter,
  AirQualityParameterName,
  AQILog,
} from "../../models/common";
import type { ReactNode } from "react";
import { formatDate } from "../../utils";
import { getColorForValue } from "../../atoms/aqiStandard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const AQ_PARAMETER_NAMES: AirQualityParameterName[] = [
  "humidity",
  "temp",
  "pm2.5",
  "pm10.0",
  "co2",
  "tvoc",
  "hcho",
  "co",
  "so2",
  "no",
  "no2",
  "o2",
  "o3",
  "nh3",
  "ch4",
];

export interface AQITableConfig {
  selectedDevice?: { deviceId: string } | null;
  rangeMapping?: any;
  columns: Record<string, string>;
}

export interface TableColumn {
  key: string;
  title: string;
  width: string;
  render: (value: any) => ReactNode | string;
}

export interface ProcessedAQIData {
  filteredLogs: AQILog[];
  tableRows: Record<string, string>[];
  tableColumns: TableColumn[];
}

/**
 * Normalize an AirQualityParameterName to the suffix used in table column keys.
 * Examples:
 *  - 'pm2.5'  -> 'pm25'
 *  - 'pm10.0' -> 'pm10'
 */
export const normalizeParamName = (param: AirQualityParameterName): string => {
  return param.replace(/\.0$/, "").replace(/\./g, "");
};

export const findParam = (
  params: AirQualityParameter[] | undefined,
  name: AirQualityParameterName
): AirQualityParameter | undefined => {
  if (!Array.isArray(params)) return undefined;
  return params.find((p) => p.param === name);
};

/**
 * Format a parameter value for table display. Returns '-' when missing.
 * Default formatting: numeric value followed by unit (if provided).
 */
export const formatParamForTable = (
  paramObj: AirQualityParameter | undefined
): string => {
  if (!paramObj || paramObj.value == null) return "-";
  const unit = paramObj.unit ? ` ${paramObj.unit}` : "";
  const formattedValue = paramObj.value.toFixed(3); // Ensure max 3 decimal points
  return `${formattedValue}${unit}`;
};

export const extractAQITableRow = (log: AQILog): Record<string, string> => {
  const out: Record<string, string> = {
    mid: String(log.mid ?? "-"),
    timestamp: String(log.timestamp ?? "-"),
  };

  for (const name of AQ_PARAMETER_NAMES) {
    const keySuffix = normalizeParamName(name);
    const indoorKey = `indoor_${keySuffix}`;
    const outdoorKey = `outdoor_${keySuffix}`;

    const indoorParam = findParam(log.indoor_air_quality, name);
    const outdoorParam = findParam(log.outdoor_air_quality, name);

    out[indoorKey] = formatParamForTable(indoorParam);
    out[outdoorKey] = formatParamForTable(outdoorParam);
  }

  return out;
};

export const processAQILogsForTable = (
  aqiLogs: AQILog[],
  config: AQITableConfig,
  createElement?: (tag: string, props: any, children: ReactNode) => ReactNode
): ProcessedAQIData => {
  const { selectedDevice, rangeMapping, columns } = config;

  // Filter logs by selected device if provided
  const filteredLogs = selectedDevice
    ? aqiLogs.filter(
        (log) => String(log.mid) === String(selectedDevice.deviceId)
      )
    : aqiLogs;

  // Extract table rows from filtered logs
  const tableRows = filteredLogs.map((log: AQILog) => extractAQITableRow(log));

  // Hide columns without data
  const columnsWithData = Object.entries(columns).filter(([key]) => {
    return filteredLogs.some((log: AQILog) => {
      const value = extractAQITableRow(log)[key];
      return (
        value !== null && value !== undefined && value !== "" && value !== "-"
      );
    });
  });

  const tableColumns: TableColumn[] = columnsWithData.map(([key, title]) => {
    const text = String(title || key);

    return {
      key,
      title: text,
      width: "150px",
      render: (value: any) => {
        if (/timestamp|date|time|createdAt|updatedAt/i.test(key)) {
          return value
            ? formatDate(String(value), "DD-MM-YYYY, hh:mm:ss")
            : "-";
        }

        const displayValue = value ? String(value) : "-";

        // Skip styling for non-parameter columns or empty values
        if (key === "mid" || key === "timestamp" || !value || value === "-") {
          return displayValue;
        }

        // Only apply styling if range mapping is available and createElement is provided
        if (!rangeMapping || !createElement) {
          return displayValue;
        }

        // Extract parameter name from column key
        // Examples: indoor_pm25 -> pm2.5, outdoor_co2 -> co2
        const parameterMatch = key.match(/^(?:indoor_|outdoor_)?(.+)$/);
        if (!parameterMatch) return displayValue;

        let parameterName = parameterMatch[1];

        // Convert normalized names back to original format
        if (parameterName === "pm25") parameterName = "pm2.5";
        else if (parameterName === "pm10") parameterName = "pm10.0";

        // Parse numeric value from the cell value string
        const numericValue = parseFloat(String(value).replace(/[^\d.-]/g, ""));
        if (isNaN(numericValue)) return displayValue;

        // Get background color from range mapping
        const backgroundColor = getColorForValue(
          numericValue,
          parameterName,
          rangeMapping
        );

        const textColor = getTextColorForValue(
          numericValue,
          parameterName,
          rangeMapping
        );

        return createElement(
          "span",
          {
            style: {
              backgroundColor,
              color: textColor, // Use textColor from utility function
              fontWeight: "500",
              padding: "2px 4px",
              borderRadius: "4px",
              display: "inline-block",
              minWidth: "100%",
              textAlign: "center",
            },
          },
          displayValue
        );
      },
    };
  });

  return {
    filteredLogs,
    tableRows,
    tableColumns,
  };
};

export const getTextColorForValue = (
  numericValue: number,
  parameterName: string,
  rangeMapping: any
): string => {
  return (
    rangeMapping[parameterName]?.find(
      (range: any) => numericValue >= range.min && numericValue <= range.max
    )?.textColor || "#000"
  );
};

export const exportAQILogsToExcel = (
  tableRows: Record<string, string>[],
  tableColumns: TableColumn[],
  fileName = "AQI_Logs"
) => {
  if (!tableRows || tableRows.length === 0) {
    throw new Error("No data to export");
  }

  const exportData = tableRows.map((row) => {
    const exportRow: Record<string, string> = {};
    tableColumns.forEach((col) => {
      let value = row[col.key];

      if (/timestamp|date|time|createdAt|updatedAt/i.test(col.key)) {
        value = value ? formatDate(String(value), "DD-MM-YYYY, hh:mm:ss") : "-";
      }

      exportRow[col.title] = value || "-";
    });
    return exportRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "AQI Logs");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  saveAs(data, `${fileName}_${timestamp}.xlsx`);
};

export default {
  AQ_PARAMETER_NAMES,
  normalizeParamName,
  findParam,
  formatParamForTable,
  extractAQITableRow,
  processAQILogsForTable,
  exportAQILogsToExcel,
};
