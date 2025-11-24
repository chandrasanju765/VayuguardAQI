import { FormModal } from "../../components/ui/modal";
import { useMemo } from "react";
import { createCustomer, updateCustomer } from "../../data/mutations";
import toast from "react-hot-toast";
import type {
  CreateOrUpdateCustomerRequest,
  User,
  CustomerRole,
} from "../../models/Customers";
import { createCustomerFormFields } from "./utils";
import { getCurrentUser } from "../../utils";

const AddOrEditCustomerModal = ({
  isOpen,
  onClose,
  isEdit,
  customerData,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  customerData?: User | null;
}) => {
  const user = getCurrentUser();
  const role = user?.role;
  const company = user?.company || "";
  const label = role === "customer" ? "User" : "Customer";
  const initialValues = useMemo(() => {
    if (!isEdit) {
      return role === "customer" ? { company: company } : undefined;
    }
    const formValues: CreateOrUpdateCustomerRequest = {
      customerId: customerData?.customerId || "",
      company: role === "customer" ? company : customerData?.company || "",
      email: customerData?.email || "",
      name: customerData?.name || "",
      phone: customerData?.phone || "",
      user_role: customerData?.user_role as CustomerRole,
    };
    return formValues;
  }, [isEdit, customerData, role, company]);

  const handleSubmit = async (formValues?: CreateOrUpdateCustomerRequest) => {
    if (!formValues) return;

    try {
      if (!isEdit) {
        const data = await createCustomer(formValues);
        if (data.status === 200) {
          toast.success(`${label} created successfully!`);
          onClose();
        }
      } else {
        const data = await updateCustomer({
          _id: customerData?._id as string,
          body: formValues,
        });
        if (data.status === 200) {
          toast.success(`${label} updated successfully!`);
          onClose();
        }
      }
    } catch (error) {
      toast.error(
        `Failed to create ${label?.toLowerCase()}. Please try again.`
      );
    }
  };

  // If role is customer, disable company field and show default company
  const fields = useMemo(() => {
    const baseFields = createCustomerFormFields();
    if (role === "customer") {
      return baseFields.map((field) =>
        field.name === "company"
          ? { ...field, disabled: true, value: company }
          : field
      );
    }
    return baseFields;
  }, [role, company]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      isForm={true}
      initialValues={initialValues}
      fields={fields}
      onSubmit={handleSubmit}
      title={isEdit ? `Edit ${label}` : `Add New ${label}`}
      submitText={isEdit ? `Update ${label}` : `Create ${label}`}
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

export default AddOrEditCustomerModal;
