import { DownloadIcon, MapPinIcon } from "lucide-react";
import { type JSX, useState } from "react";
import { Button } from "../../components/ui/button";
import { Dropdown } from "../../components/ui/dropdown";
import DeviceDropdown from "../../components/shared/DeviceDropdown";
import { useAtom, useAtomValue } from "jotai";
import { selectedPeriodAtom } from "./jotai";
import { periodOptions } from "./utils";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import { getRangeDates } from "../../utils";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useGetAQILogsHistoryByDeviceID } from "../../data/cachedQueries";
import type { AQILog } from "../../models/common";

const HistoryHeader = (): JSX.Element => {
  const [selectedPeriod, setSelectedPeriod] = useAtom(selectedPeriodAtom);
  const selectedDevice = useAtomValue(selectedDeviceAtom);
  const [isDownloading, setIsDownloading] = useState(false);

  const { startDate, endDate } = getRangeDates(selectedPeriod);

  const { data: AQILogsHistory } = useGetAQILogsHistoryByDeviceID({
    deviceId: selectedDevice?.deviceId ?? null,
    startDate,
    endDate,
  });

  const handleDownloadAQIData = async () => {
    if (!selectedDevice?.deviceId) {
      alert("Please select a device first");
      return;
    }

    if (!AQILogsHistory?.columns || !AQILogsHistory?.data) {
      alert("No data available to download");
      return;
    }

    setIsDownloading(true);
    try {
      const { columns, data } = AQILogsHistory;

      const excelData = data.map((log: AQILog) => {
        const row: Record<string, any> = {
          [columns.mid]: log.mid,
          [columns.timestamp]: log.timestamp,
        };

        log.indoor_air_quality.forEach((param) => {
          const columnKey = `indoor_${param.param.replace(
            ".",
            ""
          )}` as keyof typeof columns;
          if (columns[columnKey]) {
            row[columns[columnKey]] = param.value;
          }
        });

        log.outdoor_air_quality.forEach((param) => {
          const columnKey = `outdoor_${param.param.replace(
            ".",
            ""
          )}` as keyof typeof columns;
          if (columns[columnKey]) {
            row[columns[columnKey]] = param.value;
          }
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AQI Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(
        blob,
        `AQI_Data_${selectedDevice.deviceId}_${startDate}_to_${endDate}.xlsx`
      );
    } catch (error) {
      console.error("Error downloading AQI data:", error);
      alert("Failed to download AQI data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full border-b border-gray-200 mb-4 py-3 px-6">
      <DeviceDropdown
        triggerClassName="w-40 gap-2 px-2 py-1 border border-gray-200 rounded-lg"
        contentClassName="border-0"
        placeholder="Select Device"
        defaultValue={selectedDevice?.deviceId}
      />

      <div className="flex items-center gap-4 text-gray-700 text-sm">
        {selectedDevice?.locationName && (
          <div className="flex gap-1 items-center w-full">
            <MapPinIcon className="w-3 h-3" />
            <div className="flex-1 text-center">
              {selectedDevice?.locationName}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="px-2 py-1 border border-gray-200 rounded-md"
          onClick={handleDownloadAQIData}
          disabled={isDownloading || !selectedDevice?.deviceId}
        >
          <DownloadIcon className="w-3 h-3" />
          <span className="text-sm font-normal">
            {isDownloading ? "Downloading..." : "AQI Data"}
          </span>
        </Button>

        <Dropdown
          options={periodOptions}
          defaultValue={selectedPeriod}
          onValueChange={(v: string) => setSelectedPeriod(v)}
          triggerClassName="w-30 gap-2 px-2 py-1 border border-gray-200 rounded-lg"
          contentClassName="border-0"
          placeholder="Select period"
        />
      </div>
    </div>
  );
};

export default HistoryHeader;
