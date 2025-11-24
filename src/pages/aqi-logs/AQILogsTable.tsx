import { MoreVerticalIcon } from "lucide-react";
import type { JSX } from "react";
import { useMemo, createElement } from "react";
import { DataTable } from "../../components/ui/table";
import { useGetAQILogsByRole } from "../../data/cachedQueries";
import { getAuthData } from "../login/utils";
import { processAQILogsForTable } from "./utils";
import { useAtomValue } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import { currentRangeMappingAtom } from "../../atoms/aqiStandard";

export const AQILogsTable = (): JSX.Element => {
  const authData = getAuthData();
  const userRole = authData?.role || "customer";

  const roleOrUserId = userRole === "admin" ? "admin" : authData?._id || "";

  const { data, isLoading } = useGetAQILogsByRole(roleOrUserId);
  const aqiLogs = data?.data || [];
  const columns = data?.columns || {};

  const selectedDevice = useAtomValue(selectedDeviceAtom);
  const currentRangeMapping = useAtomValue(currentRangeMappingAtom);

  const { tableRows, tableColumns } = useMemo(() => {
    return processAQILogsForTable(
      aqiLogs,
      {
        selectedDevice,
        rangeMapping: currentRangeMapping,
        columns,
      },
      createElement
    );
  }, [aqiLogs, selectedDevice, currentRangeMapping, columns]);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <DataTable
        data={tableRows}
        loading={isLoading}
        columns={tableColumns}
        itemsPerPage={10}
        searchable={false}
        sortable={true}
        showPagination={true}
        showItemCount={true}
        variant="default"
        className="h-full"
        actions={() => (
          <div className="flex items-center justify-center p-1 bg-gray-50 rounded-r-lg">
            <MoreVerticalIcon className="w-4 h-4" />
          </div>
        )}
      />
    </div>
  );
};

export default AQILogsTable;
