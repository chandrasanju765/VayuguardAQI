import { FormModal } from "../../components/ui/modal";
import { useGetAQIDevices } from "../../data/cachedQueries";
import { useMemo } from "react";
import { createTemplate, updateTemplate } from "../../data/mutations";
import toast from "react-hot-toast";
import { createTemplateFormFields, createTemplateDeviceOptions } from "./utils";
import type {
  CreateOrUpdateTemplateRequest,
  Template,
} from "../../models/Templates";
import { getAuthData } from "../login/utils";
import { useSetAtom } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";

const AddOrEditTemplateModal = ({
  isOpen,
  onClose,
  isEdit,
  templateData,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  templateData?: Template | null;
}) => {
  const authData = getAuthData();
  const currentUserCompany =
    authData?.role === "admin" ? "admin" : authData?.company || "";
  const setSelectedDevice = useSetAtom(selectedDeviceAtom);

  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError,
  } = useGetAQIDevices();
  const devices = devicesData?.data || [];
  const deviceOptions = useMemo(() => {
    const options = createTemplateDeviceOptions(devices);
    return options;
  }, [devices]);

  const fields = useMemo(() => {
    const formFields = createTemplateFormFields(
      deviceOptions,
      currentUserCompany
    );

    // Add onChange handler to deviceId field to update global selectedDevice
    const enhancedFields = formFields.map((field) => {
      if (field.name === "deviceId") {
        return {
          ...field,
          onChange: (deviceId: string) => {
            // Find the full device object by device.deviceId
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
  }, [deviceOptions, currentUserCompany, devices, setSelectedDevice]);

  const initialValues = useMemo(() => {
    const baseValues: CreateOrUpdateTemplateRequest = {
      dashboardId: "",
      title: "",
      description: "",
      deviceId: "",
      company: currentUserCompany,
    };

    if (!isEdit) return baseValues;

    const formValues: CreateOrUpdateTemplateRequest = {
      dashboardId: templateData?.dashboardId ?? "",
      title: templateData?.title ?? "",
      description: templateData?.description ?? "",
      deviceId:
        typeof templateData?.deviceId === "object"
          ? templateData?.deviceId?.deviceId ?? ""
          : templateData?.deviceId ?? "",
      company: currentUserCompany,
    };
    return formValues;
  }, [isEdit, templateData, currentUserCompany]);

  const handleSubmit = async (formValues?: CreateOrUpdateTemplateRequest) => {
    if (!formValues) return;

    // Find the device and convert deviceId to _id for both create and update
    const selectedDevice = devices.find(
      (device) => device.deviceId === formValues.deviceId
    );
    const payload = {
      ...formValues,
      deviceId: selectedDevice?._id || formValues.deviceId,
      ...(!isEdit && { createdBy: authData?._id }),
    };

    try {
      if (!isEdit) {
        const data = await createTemplate(payload);
        if (data.status === 200) {
          toast.success("Template created successfully!");
          onClose();
        }
      } else {
        const data = await updateTemplate({
          _id: templateData?._id as string,
          body: payload,
        });
        if (data.status === 200) {
          toast.success("Template updated successfully!");
          onClose();
        }
      }
    } catch (error) {
      toast.error("Failed to create template. Please try again.");
    }
  };

  const isLoadingData = devicesLoading;
  const hasDataErrors = devicesError;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      isForm={true}
      initialValues={initialValues}
      fields={fields}
      onSubmit={handleSubmit}
      title={isEdit ? "Edit Template" : "Add New Template"}
      submitText={isEdit ? "Update Template" : "Create Template"}
      cancelText="Cancel"
      loading={isLoadingData}
      size="md"
      scrollable={true}
      maxHeight="70vh"
    >
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600">
          💡 All fields marked with * are required
        </p>
        {isLoadingData && (
          <p className="text-sm text-blue-500 mt-1">
            Loading AQI devices data...
          </p>
        )}
        {hasDataErrors && (
          <p className="text-sm text-amber-600 mt-1">
            ⚠️ Some options may be limited due to data loading errors. Form will
            still work with available data.
          </p>
        )}
      </div>
    </FormModal>
  );
};

export default AddOrEditTemplateModal;
