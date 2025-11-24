import type { FormField } from "../../components/ui/modal";
import type {
  CreateOrUpdateAPISubscriptionRequest,
  APISubscriptionColumns,
} from "../../models/APISubscriptions";
import { z } from "zod";
import type { AQIDevice } from "../../models/AQIDevices";

export const APISubscriptionTableColumnLabels: Record<
  keyof APISubscriptionColumns,
  string
> = {
  active: "Active",
  apiKey: "API Key",
  deviceId: "Device",
  subscriberEmail: "Subscriber Email",
  subscriberName: "Subscriber Name",
  subscriptionId: "Subscription ID",
};

export interface TypeSafeFormField extends Omit<FormField, "name"> {
  name: keyof CreateOrUpdateAPISubscriptionRequest;
}

export const ACTIVE_STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export const createAPISubscriptionFormFields = (
  deviceOptions: { label: string; value: string }[] = []
): TypeSafeFormField[] => {
  const fields: TypeSafeFormField[] = [
    {
      name: "subscriptionId",
      label: "Subscription ID",
      type: "text",
      required: true,
      placeholder: "Enter Subscription ID",
      validation: z.string().min(1, "Subscription ID is required"),
    },
    {
      name: "subscriberName",
      label: "Subscriber Name",
      type: "text",
      required: true,
      placeholder: "Enter Subscriber Name",
      validation: z.string().min(1, "Subscriber Name is required"),
    },
    {
      name: "subscriberEmail",
      label: "Subscriber Email",
      type: "email",
      required: true,
      placeholder: "Enter Subscriber Email Address",
      validation: z.string().email("Please enter a valid email address"),
    },
    {
      name: "deviceId",
      label: "Device",
      type: "select",
      required: true,
      options: deviceOptions,
      placeholder: "Select a device",
      validation: z.string().min(1, "Device selection is required"),
    },
    {
      name: "active",
      label: "Status",
      type: "select",
      required: true,
      options: ACTIVE_STATUS_OPTIONS,
      validation: z.string().min(1, "Status selection is required"),
    },
  ];

  return fields;
};

export const createDeviceOptions = (devices: AQIDevice[] = []) => {
  return devices.map((device) => ({
    label: `${device.name} (${device.deviceId})`,
    value: device.deviceId,
  }));
};

export const formatAPISubscriptionFormData = (
  formData: Record<string, any>
): CreateOrUpdateAPISubscriptionRequest => {
  return {
    subscriptionId: formData.subscriptionId,
    subscriberName: formData.subscriberName,
    subscriberEmail: formData.subscriberEmail,
    deviceId: formData.deviceId,
    active: formData.active === "true",
  };
};
