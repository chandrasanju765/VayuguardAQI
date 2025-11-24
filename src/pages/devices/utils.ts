import type { FormField } from "../../components/ui/modal";
import type {
  CreateOrUpdateAQIDeviceRequest,
  AQIDeviceColumns,
} from "../../models/AQIDevices";
import type { User } from "../../models/common";
import type { IndianCitiesData, StationOption } from "../../types";
import {
  AQI_DEVICE_STATUS_OPTIONS,
  SUBSCRIPTION_TYPE_OPTIONS,
} from "../../utils";
import indianCities from "../../assets/indianCities.json";

const typedIndianCities = indianCities as IndianCitiesData;

export const DeviceTableColumnLabels: Record<keyof AQIDeviceColumns, string> = {
  deviceId: "Device ID",
  name: "Name",
  locationName: "Location",
  status: "Status",
  customerId: "Company", // Dev Note: BE has customerId, not company
  assignedUserId: "User",
  subscriptionType: "Subscription Type",
  subsciptionExpiryDate: "Subscription Last Date",
  editableByCustomer: "Editable by Customer",
};

export interface DeviceFormValues extends CreateOrUpdateAQIDeviceRequest {}

export interface TypeSafeFormField extends Omit<FormField, "name"> {
  name: keyof DeviceFormValues;
  onChange?: (value: string) => void; // Add onChange handler
}

export const createDeviceFormFields = (
  customers: User[] = [],
  onCityChange?: (cityName: string) => void,
  stationOptions: StationOption[] = [],
  disableStationField: boolean = false
): TypeSafeFormField[] => {
  const fields: TypeSafeFormField[] = [
    {
      name: "deviceId",
      label: "Device ID",
      type: "text",
      required: true,
      placeholder: "Enter Device ID",
    },
    {
      name: "name",
      label: "Device Name",
      type: "text",
      required: true,
      placeholder: "Enter Device Name",
    },
    {
      name: "locationName",
      label: "Location",
      type: "text",
      required: true,
      placeholder: "Enter location",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: AQI_DEVICE_STATUS_OPTIONS,
    },
    {
      name: "assignedUserId",
      label: "Assigned User",
      type: "select",
      required: true,
      options: customers.map((user) => ({
        value: user._id,
        label: user.name,
      })),
    },
    {
      name: "customerId",
      label: "Company",
      type: "select",
      required: true,
      options: Array.from(
        new Set(customers.map((customer) => customer.company))
      ).map((company) => ({
        value: company,
        label: company,
      })),
    },
    {
      name: "subscriptionType",
      label: "Subscription Type",
      type: "select",
      required: true,
      options: SUBSCRIPTION_TYPE_OPTIONS,
    },
    {
      name: "subsciptionExpiryDate",
      label: "Subscription Expiry Date",
      type: "date",
      required: true,
    },
    {
      name: "editableByCustomer",
      label: "Editable by Customer",
      type: "checkbox",
    },
    {
      name: "outdoorAPICity",
      label: "Outdoor API City",
      type: "select",
      required: false,
      options: typedIndianCities.map((city) => ({
        value: `${city.id} - ${city.name}`,
        label: `${city.name}, ${city.state}`,
      })),
      onChange: onCityChange,
    },
    {
      name: "outdoorAPIStation",
      label: "Outdoor API Station",
      type: "select",
      required: false,
      options: stationOptions.map((station) => ({
        value: station.value,
        label: station.label,
      })),
      disabled: stationOptions.length === 0 || disableStationField,
      placeholder:
        stationOptions.length === 0
          ? "Select a city first"
          : disableStationField
          ? "Change city to modify station"
          : "Select station",
    },
  ];

  return fields;
};

export const deviceFormFields: TypeSafeFormField[] = createDeviceFormFields();
