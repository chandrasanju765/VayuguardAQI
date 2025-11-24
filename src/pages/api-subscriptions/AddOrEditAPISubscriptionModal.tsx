import { FormModal } from "../../components/ui/modal";
import { useMemo } from "react";
import {
  createAPISubscription,
  updateAPISubscription,
} from "../../data/mutations";
import toast from "react-hot-toast";
import {
  createAPISubscriptionFormFields,
  createDeviceOptions,
  formatAPISubscriptionFormData,
} from "./utils";
import { useGetAQIDevices } from "../../data/cachedQueries";
import type { APISubscription } from "../../models/APISubscriptions";
import { useSetAtom } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";

const AddOrEditAPISubscriptionModal = ({
  isOpen,
  onClose,
  isEdit,
  APISubscriptionData,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  APISubscriptionData?: APISubscription | null;
}) => {
  const { data: devicesData } = useGetAQIDevices();
  const devices = devicesData?.data || [];
  const setSelectedDevice = useSetAtom(selectedDeviceAtom);

  const deviceOptions = useMemo(() => {
    const options = createDeviceOptions(devices);
    return options;
  }, [devices]);

  const fields = useMemo(() => {
    const formFields = createAPISubscriptionFormFields(deviceOptions);

    // Add onChange handler to deviceId field to update global selectedDevice
    const enhancedFields = formFields.map((field) => {
      if (field.name === "deviceId") {
        return {
          ...field,
          onChange: (deviceId: string) => {
            // Find the full device object by deviceId
            const selectedDevice = devices.find(
              (device) => device.deviceId === deviceId
            );
            setSelectedDevice(selectedDevice || null);
          },
        };
      }
      return field;
    });

    return enhancedFields;
  }, [deviceOptions, devices, setSelectedDevice]);

  const initialValues = useMemo(() => {
    if (!isEdit || !APISubscriptionData) {
      return undefined;
    }

    const formValues = {
      active: APISubscriptionData.active ? "true" : "false",
      deviceId:
        typeof APISubscriptionData.deviceId === "object"
          ? APISubscriptionData.deviceId._id
          : APISubscriptionData.deviceId,
      subscriberEmail: APISubscriptionData.subscriberEmail,
      subscriberName: APISubscriptionData.subscriberName,
      subscriptionId: APISubscriptionData.subscriptionId,
    };

    return formValues;
  }, [isEdit, APISubscriptionData]);

  const handleSubmit = async (formValues?: Record<string, any>) => {
    if (!formValues) return;

    try {
      const apiPayload = formatAPISubscriptionFormData(formValues);

      if (!isEdit) {
        const data = await createAPISubscription(apiPayload);
        if (data.status === 200) {
          toast.success("API subscription created successfully!");
          onClose();
        }
      } else {
        const data = await updateAPISubscription({
          _id: APISubscriptionData?._id as string,
          body: apiPayload,
        });
        if (data.status === 200) {
          toast.success("API subscription updated successfully!");
          onClose();
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save API subscription. Please try again.");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      isForm={true}
      initialValues={initialValues}
      fields={fields}
      onSubmit={handleSubmit}
      title={isEdit ? "Edit Subscription" : "Add New Subscription"}
      submitText={isEdit ? "Update Subscription" : "Create Subscription"}
      cancelText="Cancel"
      size="md"
      scrollable={true}
      maxHeight="70vh"
    >
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600">
          💡 All fields marked with * are required
        </p>
      </div>
    </FormModal>
  );
};

export default AddOrEditAPISubscriptionModal;
