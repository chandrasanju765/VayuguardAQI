import { useState, useMemo } from "react";
import DeviceDropdown from "../../components/shared/DeviceDropdown";
import { Button } from "../../components/ui/button";
import { DownloadIcon, RefreshCcwIcon } from "lucide-react";
import { useGetAQILogsByRole } from "../../data/cachedQueries";
import { getAuthData } from "../login/utils";
import toast from "react-hot-toast";
import { useAtomValue } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import { currentRangeMappingAtom } from "../../atoms/aqiStandard";
import { processAQILogsForTable, exportAQILogsToExcel } from "./utils";

const AQILogsHeader = () => {
  const authData = getAuthData();
  const userRole = authData?.role || "customer";
  const roleOrUserId = userRole === "admin" ? "admin" : authData?._id || "";
  const { data, mutate: mutateLogs } = useGetAQILogsByRole(roleOrUserId);
  const selectedDevice = useAtomValue(selectedDeviceAtom);
  const currentRangeMapping = useAtomValue(currentRangeMappingAtom);

  const aqiLogs = data?.data || [];
  const columns = data?.columns || {};

  const { tableRows, tableColumns } = useMemo(() => {
    return processAQILogsForTable(aqiLogs, {
      selectedDevice,
      rangeMapping: currentRangeMapping,
      columns,
    });
  }, [aqiLogs, selectedDevice, currentRangeMapping, columns]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const promises: Array<Promise<any>> = [];
      if (mutateLogs) promises.push(mutateLogs());
      await Promise.all(promises);
    } catch (e) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      exportAQILogsToExcel(tableRows, tableColumns);
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="flex items-center justify-between w-full border-b border-gray-200 mb-8 py-3 px-6">
      <DeviceDropdown
        triggerClassName="w-40 gap-2 px-2 py-1 border border-gray-200 rounded-lg"
        contentClassName="border-0"
        placeholder="Select Device"
        defaultValue={selectedDevice?.deviceId}
      />

      <div className="flex items-center gap-4 text-gray-700 text-sm">
        <Button
          variant="outline"
          className="px-2 py-1 border border-gray-200 rounded-md"
          onClick={handleExport}
        >
          <DownloadIcon className="w-3 h-3" />
          <span className="text-sm font-normal">Export All Logs</span>
        </Button>

        <Button
          variant="outline"
          className="px-2 py-1 border border-gray-200 rounded-md"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcwIcon
            className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-normal">Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default AQILogsHeader;
