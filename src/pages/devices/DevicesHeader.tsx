import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "../../components/ui/button";
import AddOrEditDeviceModal from "./AddOrEditDeviceModal";
import AssignToCustomerModal from "./AssignToCustomerModal";
import { ConfirmationModal } from "../../components/ui/modal";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import { useState } from "react";
import { deleteAQIDevice } from "../../data/mutations";
import { toast } from "react-hot-toast";
import { getAuthData } from "../login/utils";

const DevicesHeader = () => {
  const [selectedAQIDevice, setSelectedAQIDevice] = useAtom(selectedDeviceAtom);
  const [isAddOrEditDeviceModalOpen, setIsAddOrEditDeviceModalOpen] =
    useState(false);
  const [isDeleteDeviceModalOpen, setIsDeleteDeviceModalOpen] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const authData = getAuthData();
  const isAdmin = authData?.role === "admin";
  const isUserAdmin = authData?.user_role === "useradmin";

  const handleDeleteDevice = async (_id: string) => {
    try {
      setIsDeleteInProgress(true);
      const response = await deleteAQIDevice(_id);
      if (response.status === 200) {
        setIsDeleteDeviceModalOpen(false);
        toast.success("Device deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete device");
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1">Devices</h1>
          <p className="text-sm h-4 text-gray-600">
            {selectedAQIDevice ? (
              <>
                Selected:{" "}
                <span className="font-medium text-cyan-700">
                  {selectedAQIDevice.name}
                </span>
              </>
            ) : (
              <span className="font-medium text-gray-500">
                No device selected
              </span>
            )}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setIsEditMode(true);
                setIsAddOrEditDeviceModalOpen(true);
              }}
              disabled={!selectedAQIDevice}
            >
              <PencilIcon />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsDeleteDeviceModalOpen(true)}
              disabled={!selectedAQIDevice}
            >
              <Trash2Icon />
              Delete
            </Button>
            <Button
              className="bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600"
              onClick={() => setIsAddOrEditDeviceModalOpen(true)}
            >
              <PlusIcon />
              Device
            </Button>
          </div>
        )}

        {isUserAdmin && (
          <div className="flex items-center gap-2">
            <Button
              className="bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsAssignModalOpen(true)}
              disabled={!selectedAQIDevice}
            >
              Assign to User
            </Button>
          </div>
        )}
      </div>

      {isAddOrEditDeviceModalOpen && (
        <AddOrEditDeviceModal
          isOpen={isAddOrEditDeviceModalOpen}
          onClose={() => {
            setIsAddOrEditDeviceModalOpen(false);
            setSelectedAQIDevice(null);
            setIsEditMode(false);
          }}
          isEdit={isEditMode}
          deviceData={isEditMode ? selectedAQIDevice : undefined}
        />
      )}

      {isAssignModalOpen && (
        <AssignToCustomerModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          deviceData={selectedAQIDevice}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteDeviceModalOpen}
        onClose={() => {
          setIsDeleteDeviceModalOpen(false);
          setSelectedAQIDevice(null);
        }}
        onConfirm={() => handleDeleteDevice(selectedAQIDevice?._id as string)}
        title={`Delete Device`}
        description={`Are you sure you want to delete "${
          selectedAQIDevice?.name || "this device"
        }"? This will remove all associated data and cannot be undone.`}
        confirmText="Delete Device"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleteInProgress}
      />
    </>
  );
};

export default DevicesHeader;
