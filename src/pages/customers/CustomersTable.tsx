import { useSetAtom, useAtomValue } from "jotai";
import { DataTable } from "../../components/ui/table";
import { toggleCustomerSelectionAtom, selectedCustomerAtom } from "./jotai";
import { useGetCustomers } from "../../data/cachedQueries";
import { useMemo } from "react";
import type { User } from "../../models/Customers";
import type { ColumnDef } from "../../components/ui/table";
import { getCurrentUser } from "../../utils";

const CustomersTable = () => {
  const role = getCurrentUser()?.role;
  const label = role === "customer" ? "User" : "Customer";
  const setToggleCustomerSelectionAtom = useSetAtom(
    toggleCustomerSelectionAtom
  );
  const selectedCustomer = useAtomValue(selectedCustomerAtom);

  const { data } = useGetCustomers();
  const customers = data?.data || [];
  const columns = data?.columns || {};

  const handleRowClick = (customer: User) => {
    setToggleCustomerSelectionAtom(customer);
  };

  const tableColumns = useMemo(() => {
    const radioColumn: ColumnDef<User> = {
      key: "selection",
      title: "",
      render: (_value: any, row: User) => {
        const isSelected = selectedCustomer?._id === row._id;
        return (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name={`${label.toLowerCase()}Selection`}
              checked={isSelected}
              onChange={() => setToggleCustomerSelectionAtom(row)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      width: "w-[60px]",
    };

    const cols: ColumnDef<User>[] = Object.entries(columns).map(
      ([key, title]) => {
        let colTitle = title;
        if (key === "customerId" && role === "customer") {
          colTitle = "User ID";
        }
        return {
          key: String(key),
          title: String(colTitle),
          render: (value: User[keyof User]) => {
            return value ? value : "-";
          },
        };
      }
    );
    return [radioColumn, ...cols];
  }, [data, selectedCustomer, setToggleCustomerSelectionAtom]);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <DataTable
        data={customers}
        searchable={false}
        onRowClick={handleRowClick}
        columns={tableColumns}
        className="h-full"
      />
    </div>
  );
};

export default CustomersTable;
