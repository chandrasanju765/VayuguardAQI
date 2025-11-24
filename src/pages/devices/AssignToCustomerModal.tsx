import { useMemo, useState } from "react";
import { FormModal, type FormField } from "../../components/ui/modal";
import type {
  AQIDevice,
  CreateOrUpdateAQIDeviceRequest,
} from "../../models/AQIDevices";
import type { User } from "../../models/common";
import { useGetCustomers } from "../../data/cachedQueries";
import { updateAQIDevice } from "../../data/mutations";
import toast from "react-hot-toast";

const AssignToCustomerModal = ({
  isOpen,
  onClose,
  deviceData,
}: {
  isOpen: boolean;
  onClose: () => void;
  deviceData: AQIDevice | null;
}) => {
  const { data: customersData, isLoading, error } = useGetCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executives: User[] = useMemo(() => {
    const users = customersData?.data ?? customersData ?? [];
    return (users as User[]).filter((u) => u.user_role === "executive");
  }, [customersData]);

  const fields: FormField[] = useMemo(() => {
    return [
      {
        name: "assignedUserId",
        label: "Assign to Executive",
        type: "select",
        required: false,
        options: executives.map((u) => ({
          value: u._id,
          label: `${u.name} (${u.email})`,
        })),
        placeholder: executives.length
          ? "Select executive"
          : "No executives found",
      },
    ];
  }, [executives]);

  const initialValues = useMemo(() => {
    const assignedUserId =
      deviceData?.assignedUserId &&
      typeof deviceData.assignedUserId === "object"
        ? deviceData.assignedUserId._id
        : typeof deviceData?.assignedUserId === "string"
        ? deviceData.assignedUserId
        : "";
    return { assignedUserId };
  }, [deviceData]);

  const handleSubmit = async (values?: { assignedUserId?: string }) => {
    if (!deviceData?._id) return;

    const assignedUserId =
      values?.assignedUserId && values.assignedUserId.trim() !== ""
        ? values.assignedUserId
        : null;

    const body: CreateOrUpdateAQIDeviceRequest = {
      deviceId: deviceData.deviceId,
      name: deviceData.name,
      locationName: deviceData.locationName,
      status: deviceData.status,
      customerId: deviceData.customerId,
      assignedUserId,
      subscriptionType: deviceData.subscriptionType,
      subsciptionExpiryDate: deviceData.subsciptionExpiryDate,
      editableByCustomer: deviceData.editableByCustomer,
      outdoorAPICity: deviceData.outdoorAPICity,
      outdoorAPIStation: deviceData.outdoorAPIStation,
      outdoorAPIState: deviceData.outdoorAPIState ?? null,
    };

    try {
      setIsSubmitting(true);
      const res = await updateAQIDevice({ _id: deviceData._id, body });
      if (res.status === 200) {
        toast.success(
          assignedUserId
            ? "Device assignment updated"
            : "Device unassigned successfully"
        );
        onClose();
      }
    } catch (e) {
      toast.error(
        assignedUserId ? "Failed to assign device" : "Failed to unassign device"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      isForm={true}
      fields={fields}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      title="Assign to Customer"
      submitText="Submit"
      cancelText="Cancel"
      loading={isLoading || isSubmitting}
      size="sm"
    >
      {error ? (
        <p className="text-sm text-red-600">Failed to load users.</p>
      ) : null}
    </FormModal>
  );
};

export default AssignToCustomerModal;
