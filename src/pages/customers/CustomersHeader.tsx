import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "../../components/ui/button";
import AddOrEditCustomerModal from "./AddOrEditCustomerModal";
import { ConfirmationModal } from "../../components/ui/modal";
import { selectedCustomerAtom } from "./jotai";
import { useState } from "react";
import { deleteCustomer } from "../../data/mutations";
import { toast } from "react-hot-toast";
import { getCurrentUser } from "../../utils";

const CustomersHeader = () => {
  const [selectedCustomer, setSelectedCustomer] = useAtom(selectedCustomerAtom);
  const [isAddOrEditCustomerModalOpen, setIsAddOrEditCustomerModalOpen] =
    useState(false);
  const [isDeleteCustomerModalOpen, setIsDeleteCustomerModalOpen] =
    useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const role = getCurrentUser()?.role;
  const label = role === "customer" ? "User" : "Customer";

  const handleDeleteCustomer = async (_id: string) => {
    try {
      setIsDeleteInProgress(true);
      const response = await deleteCustomer(_id);
      if (response.status === 200) {
        setIsDeleteCustomerModalOpen(false);
        toast.success("Customer deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1">{label + "s"}</h1>
          <p className="text-sm h-4 text-gray-600">
            {selectedCustomer ? (
              <>
                Selected:{" "}
                <span className="font-medium text-cyan-700">
                  {selectedCustomer.name}
                </span>
              </>
            ) : (
              <span className="font-medium text-gray-500">
                No {label.toLowerCase()} selected
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setIsEditMode(true);
              setIsAddOrEditCustomerModalOpen(true);
            }}
            disabled={!selectedCustomer}
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsDeleteCustomerModalOpen(true)}
            disabled={!selectedCustomer}
          >
            <Trash2Icon />
            Delete
          </Button>
          <Button
            className="bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600"
            onClick={() => setIsAddOrEditCustomerModalOpen(true)}
          >
            <PlusIcon />
            {label}
          </Button>
        </div>
      </div>

      {isAddOrEditCustomerModalOpen && (
        <AddOrEditCustomerModal
          isOpen={isAddOrEditCustomerModalOpen}
          onClose={() => {
            setIsAddOrEditCustomerModalOpen(false);
            setSelectedCustomer(null);
            setIsEditMode(false);
          }}
          isEdit={isEditMode}
          customerData={isEditMode ? selectedCustomer : undefined}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteCustomerModalOpen}
        onClose={() => {
          setIsDeleteCustomerModalOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={() => handleDeleteCustomer(selectedCustomer?._id as string)}
        title={`Delete ${label}`}
        description={`Are you sure you want to delete "${
          selectedCustomer?.name ||
          (label === "User" ? "this user" : "this customer")
        }"? This will remove all associated data and cannot be undone.`}
        confirmText={`Delete ${label}`}
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleteInProgress}
      />
    </>
  );
};

export default CustomersHeader;
