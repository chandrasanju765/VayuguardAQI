import { useSetAtom, useAtomValue } from "jotai";
import { DataTable } from "../../components/ui/table";
import { toggleTemplateSelectionAtom, selectedTemplateAtom } from "./jotai";
import { useGetTemplates } from "../../data/cachedQueries";
import { useMemo } from "react";
import type { Template, TemplateColumns } from "../../models/Templates";
import type { AQIDevice } from "../../models/AQIDevices";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const TemplatesTable = () => {
  const setToggleTemplateSelectionAtom = useSetAtom(
    toggleTemplateSelectionAtom
  );
  const selectedTemplate = useAtomValue(selectedTemplateAtom);

  const { data } = useGetTemplates();
  const templates = data?.data || [];
  const columns = data?.columns || {};

  const navigate = useNavigate();

  const handleRowClick = (template: Template) => {
    setToggleTemplateSelectionAtom(template);
  };

  const tableColumns = useMemo(() => {
    // Add radio button column at the beginning
    const radioColumn = {
      key: "selection" as const,
      title: "",
      render: (_value: any, row: Template) => {
        const isSelected = selectedTemplate?._id === row._id;
        return (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="templateSelection"
              checked={isSelected}
              onChange={() => setToggleTemplateSelectionAtom(row)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      width: "w-[60px]",
    };

    const cols = Object.entries(columns).map(([key, title]) => {
      const typedKey = key as keyof TemplateColumns;
      return {
        key: typedKey,
        title: String(title),
        render: (value: Template[keyof Template], row: Template) => {
          if (typedKey === "deviceId") {
            if (value && typeof value === "object" && !Array.isArray(value)) {
              const device = value as AQIDevice;
              return <span>{device.name || "-"}</span>;
            }
            return value ? String(value) : "-";
          }
          if (typedKey === "createdBy") {
            if (
              value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              "name" in value
            ) {
              return <span>{value.name || "-"}</span>;
            }
          }
          if (typedKey === "template") {
            return (
              <Button
                className="bg-cyan-500 text-white"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click when clicking setup button
                  navigate(
                    `/templates/setup?templateId=${(row as Template)._id}`
                  );
                }}
              >
                Setup
              </Button>
            );
          }
          return value ? String(value) : "-";
        },
      };
    });
    return [radioColumn, ...cols];
  }, [data, selectedTemplate, setToggleTemplateSelectionAtom, navigate]);

  return (
    <DataTable
      data={templates}
      searchable={false}
      onRowClick={handleRowClick}
      columns={tableColumns}
    />
  );
};

export default TemplatesTable;
