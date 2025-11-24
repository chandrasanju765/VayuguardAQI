import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "../../components/ui/button";
import AddOrEditAPISubscriptionModal from "./AddOrEditAPISubscriptionModal";
import { ConfirmationModal } from "../../components/ui/modal";
import { selectedAPISubscriptionAtom } from "./jotai";
import { useState } from "react";
import { deleteAPISubscription } from "../../data/mutations";
import { toast } from "react-hot-toast";

const APISubscriptionsHeader = () => {
  const [selectedAPISubscription, setSelectedAPISubscription] = useAtom(
    selectedAPISubscriptionAtom
  );
  const [
    isAddOrEditAPISubscriptionModalOpen,
    setIsAddOrEditAPISubscriptionModalOpen,
  ] = useState(false);
  const [
    isDeleteAPISubscriptionModalOpen,
    setIsDeleteAPISubscriptionModalOpen,
  ] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDeleteAPISubscription = async (_id: string) => {
    try {
      setIsDeleteInProgress(true);
      const response = await deleteAPISubscription(_id);
      if (response.status === 200) {
        setIsDeleteAPISubscriptionModalOpen(false);
        toast.success("API subscription deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete API subscription");
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1">API Subscriptions</h1>
          <p className="text-sm h-4 text-gray-600">
            {selectedAPISubscription ? (
              <>
                Selected:{" "}
                <span className="font-medium text-cyan-700">
                  {selectedAPISubscription.subscriptionId}
                </span>
              </>
            ) : (
              <span className="font-medium text-gray-500">
                No API subscription selected
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
              setIsAddOrEditAPISubscriptionModalOpen(true);
            }}
            disabled={!selectedAPISubscription}
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsDeleteAPISubscriptionModalOpen(true)}
            disabled={!selectedAPISubscription}
          >
            <Trash2Icon />
            Delete
          </Button>
          <Button
            className="bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600"
            onClick={() => setIsAddOrEditAPISubscriptionModalOpen(true)}
          >
            <PlusIcon />
            Subscription
          </Button>
        </div>
      </div>

      {isAddOrEditAPISubscriptionModalOpen && (
        <AddOrEditAPISubscriptionModal
          isOpen={isAddOrEditAPISubscriptionModalOpen}
          onClose={() => {
            setIsAddOrEditAPISubscriptionModalOpen(false);
            setSelectedAPISubscription(null);
            setIsEditMode(false);
          }}
          isEdit={isEditMode}
          APISubscriptionData={isEditMode ? selectedAPISubscription : undefined}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteAPISubscriptionModalOpen}
        onClose={() => {
          setIsDeleteAPISubscriptionModalOpen(false);
          setSelectedAPISubscription(null);
        }}
        onConfirm={() =>
          handleDeleteAPISubscription(selectedAPISubscription?._id as string)
        }
        title={`Delete API Subscription`}
        description={`Are you sure you want to delete "${
          selectedAPISubscription?.subscriptionId || "this API subscription"
        }"? This will remove all associated data and cannot be undone.`}
        confirmText="Delete API Subscription"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleteInProgress}
      />
    </>
  );
};

export default APISubscriptionsHeader;
