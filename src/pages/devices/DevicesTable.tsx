import { useSetAtom, useAtomValue } from "jotai";
import { DataTable } from "../../components/ui/table";
import {
  toggleDeviceSelectionAtom,
  selectedDeviceAtom,
} from "../../atoms/selectedDevice";
import { useGetAQIDevices } from "../../data/cachedQueries";
import type { AQIDevice } from "../../models/AQIDevices";
import { formatDate, calculateDaysRemaining } from "../../utils";
import { useMemo } from "react";

const DevicesTable = () => {
  const setToggleDeviceSelectionAtom = useSetAtom(toggleDeviceSelectionAtom);
  const selectedDevice = useAtomValue(selectedDeviceAtom);

  const { data } = useGetAQIDevices();
  const columns = data?.columns || {};
  let devices = data?.data || [];

  const handleRowClick = (device: AQIDevice) => {
    setToggleDeviceSelectionAtom(device);
  };

  const tableColumns = useMemo(() => {
    const radioColumn = {
      key: "selection" as const,
      title: "",
      render: (_value: any, row: AQIDevice) => {
        const isSelected = selectedDevice?._id === row._id;
        return (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="deviceSelection"
              checked={isSelected}
              onChange={() => setToggleDeviceSelectionAtom(row)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      width: "w-[60px]",
    };

    const cols = Object.entries(columns).map(([key, title]) => {
      const typedKey = key as keyof AQIDevice;
      return {
        key: typedKey,
        title: String(title),
        render: (value: AQIDevice[keyof AQIDevice], row: AQIDevice) => {
          if (
            typedKey === "assignedUserId" &&
            typeof row.assignedUserId === "object"
          ) {
            return row.assignedUserId?.name || "-";
          }

          if (typedKey === "status") {
            if (value === "active") {
              return (
                <span className="text-green-800 bg-green-200 px-2 py-1 rounded-full text-xs">
                  {value}
                </span>
              );
            } else if (value === "inactive") {
              return (
                <span className="text-red-800 bg-red-200 px-2 py-0.5 rounded-full text-xs">
                  {value}
                </span>
              );
            } else if (value === "maintenance") {
              return (
                <span className="text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full text-xs">
                  {value}
                </span>
              );
            }
          }

          if (typedKey === "subsciptionExpiryDate") {
            const dateStr = String(row?.subsciptionExpiryDate || "");
            if (!dateStr) return "-";
            const formattedDate = formatDate(dateStr);
            return formattedDate ? (
              <span>
                {formattedDate} [{calculateDaysRemaining(dateStr)} days left]
              </span>
            ) : (
              "-"
            );
          }

          if (typedKey === "editableByCustomer") {
            return <span>{row?.editableByCustomer ? "Yes" : "No"}</span>;
          }

          return value ? String(value) : "-";
        },
        width:
          typedKey === "subsciptionExpiryDate"
            ? "w-[200px]"
            : typedKey === "customerId"
            ? "w-[300px]"
            : typedKey === "editableByCustomer"
            ? "w-[200px]"
            : undefined,
      };
    });
    return [radioColumn, ...cols];
  }, [data, selectedDevice, setToggleDeviceSelectionAtom]);

  return (
    <DataTable
      data={devices}
      searchable={false}
      onRowClick={handleRowClick}
      columns={tableColumns}
    />
  );
};

export default DevicesTable;
