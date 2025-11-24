import { FormModal } from "../../components/ui/modal";
import { createDeviceFormFields } from "./utils";
import type { DeviceFormValues } from "./utils";
import { useGetCustomers } from "../../data/cachedQueries";
import { useMemo, useCallback, useState, useEffect } from "react";
import { createAQIDevice, updateAQIDevice } from "../../data/mutations";
import toast from "react-hot-toast";
import { formatDate } from "../../utils";
import type {
  AQIDevice,
  AQIDeviceStatus,
  CreateOrUpdateAQIDeviceRequest,
} from "../../models/AQIDevices";
import type { SubscriptionType } from "../../models/common";
import type { StationOption } from "../../types";
import { fetchStationsByCity } from "../../data/oneTimeQueries";

const AddOrEditDeviceModal = ({
  isOpen,
  onClose,
  isEdit,
  deviceData,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  deviceData?: AQIDevice | null;
}) => {
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useGetCustomers();

  const [stationOptions, setStationOptions] = useState<StationOption[]>([]);
  const [cityChanged, setCityChanged] = useState(false);

  const handleCityChange = useCallback(
    async (cityName: string) => {
      setCityChanged(true); // Mark that city has been changed
      if (cityName) {
        const apiResponse = await fetchStationsByCity(cityName);
        if (
          apiResponse &&
          apiResponse.status === "ok" &&
          apiResponse.data.length > 0
        ) {
          const stations: StationOption[] = apiResponse.data.map((item) => ({
            value: item.station.url,
            label: item.station.name,
            uid: item.uid,
            aqi: item.aqi,
            coordinates: {
              latitude: item.station.geo[0],
              longitude: item.station.geo[1],
            },
          }));
          setStationOptions(stations);
        } else {
          setStationOptions([]);
        }
      } else {
        setStationOptions([]);
      }
    },
    [fetchStationsByCity]
  );

  // Load station options when editing device with existing outdoorAPICity
  useEffect(() => {
    if (isEdit && deviceData?.outdoorAPICity && isOpen && !cityChanged) {
      handleCityChange(deviceData.outdoorAPICity);
    }
  }, [
    isEdit,
    deviceData?.outdoorAPICity,
    isOpen,
    handleCityChange,
    cityChanged,
  ]);

  const deviceFormFields = useMemo(() => {
    const safeCustomers =
      customersError || !customersData ? [] : customersData.data || [];
    return createDeviceFormFields(
      safeCustomers,
      handleCityChange,
      stationOptions,
      !cityChanged && isEdit && !!deviceData?.outdoorAPIStation // Disable if city hasn't changed and editing with existing station
    );
  }, [
    customersData,
    customersError,
    handleCityChange,
    stationOptions,
    cityChanged,
    isEdit,
    deviceData?.outdoorAPIStation,
  ]);

  const initialValues = useMemo(() => {
    if (!isEdit) return;

    const formValues: DeviceFormValues = {
      deviceId: deviceData?.deviceId || "",
      name: deviceData?.name || "",
      locationName: deviceData?.locationName || "",
      status: deviceData?.status as AQIDeviceStatus,
      customerId: deviceData?.customerId || "",
      editableByCustomer: deviceData?.editableByCustomer || false,
      subsciptionExpiryDate: formatDate(
        deviceData?.subsciptionExpiryDate || null,
        "YYYY-MM-DD"
      ),
      subscriptionType: deviceData?.subscriptionType as SubscriptionType,
      assignedUserId: deviceData?.assignedUserId?._id || "",
      outdoorAPICity: deviceData?.outdoorAPICity || null,
      outdoorAPIStation: deviceData?.outdoorAPIStation || null,
      outdoorAPIState: deviceData?.outdoorAPIState || null,
    };
    return formValues;
  }, [isEdit, deviceData]);

  const handleSubmit = async (formValues?: DeviceFormValues) => {
    if (!formValues) return;

    const selectedStation = stationOptions.find(
      (station) => station.value === formValues.outdoorAPIStation
    );

    const outdoorAPIState = selectedStation
      ? `${selectedStation.coordinates.latitude};${selectedStation.coordinates.longitude}`
      : "";

    const submissionData: CreateOrUpdateAQIDeviceRequest = {
      ...formValues,
      outdoorAPIState: outdoorAPIState,
      outdoorAPICity: formValues.outdoorAPICity,
      outdoorAPIStation: formValues.outdoorAPIStation,
      subsciptionExpiryDate: formValues.subsciptionExpiryDate
        ? formatDate(formValues.subsciptionExpiryDate, "iso")
        : null,
    };

    try {
      if (!isEdit) {
        const data = await createAQIDevice(submissionData);
        if (data.status === 200) {
          toast.success("Device created successfully!");
          onClose();
        }
      } else {
        const data = await updateAQIDevice({
          _id: deviceData?._id as string,
          body: submissionData,
        });
        if (data.status === 200) {
          toast.success("Device updated successfully!");
          onClose();
        }
      }
    } catch (error) {
      toast.error("Failed to create device. Please try again.");
    }
  };

  const isLoadingData = customersLoading;
  const hasDataErrors = customersError;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      isForm={true}
      initialValues={initialValues}
      fields={deviceFormFields}
      onSubmit={handleSubmit}
      title={isEdit ? "Edit Device" : "Add New Device"}
      submitText={isEdit ? "Update Device" : "Create Device"}
      cancelText="Cancel"
      loading={isLoadingData}
      size="md"
      scrollable={true}
      maxHeight="70vh"
    >
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600 mt-1">
          📍 Select a city first to see available AQI monitoring stations
        </p>
        {isLoadingData && (
          <p className="text-sm text-blue-500 mt-1">
            Loading customers and users data...
          </p>
        )}
        {hasDataErrors && (
          <p className="text-sm text- mt-1 ">
            ⚠️ Some options may be limited due to data loading errors. Form will
            still work with available data.
          </p>
        )}
      </div>
    </FormModal>
  );
};

export default AddOrEditDeviceModal;
