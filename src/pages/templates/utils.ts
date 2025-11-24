import type { FormField } from "../../components/ui/modal";
import type {
  CreateOrUpdateTemplateRequest,
  TemplateColumns,
} from "../../models/Templates";
import type { AQIDevice } from "../../models/AQIDevices";

export const TemplatesTableColumnLabels: Record<keyof TemplateColumns, string> =
  {
    dashboardId: "Dashboard ID",
    title: "Title",
    description: "Description",
    deviceId: "Device ID",
    company: "Company",
    createdBy: "Created By",
    template: "Template",
    share: "Share",
  };

export interface TypeSafeFormField extends Omit<FormField, "name"> {
  name: keyof CreateOrUpdateTemplateRequest;
}

export const createTemplateFormFields = (
  deviceOptions: { label: string; value: string }[] = [],
  currentUserCompany?: string
): TypeSafeFormField[] => {
  const fields: TypeSafeFormField[] = [
    {
      name: "dashboardId",
      label: "Dashboard ID",
      type: "text",
      required: true,
      placeholder: "Enter Dashboard ID",
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Enter Title",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      required: false,
      placeholder: "Enter Description",
    },
    {
      name: "deviceId",
      label: "Device ID",
      type: "select",
      required: true,
      options: deviceOptions,
      placeholder: "Select Device ID",
    },
    {
      name: "company",
      label: "Company",
      type: "text",
      required: true,
      placeholder: currentUserCompany || "Enter Company",
      readOnly: true,
      value: currentUserCompany,
    },
  ];
  return fields;
};

export const createTemplateDeviceOptions = (devices: AQIDevice[] = []) => {
  return devices.map((device) => ({
    label: `${device.name} (${device.deviceId})`,
    value: device.deviceId, // Use device.deviceId in form dropdown
  }));
};

export const deviceFormFields: TypeSafeFormField[] = createTemplateFormFields(
  []
);
