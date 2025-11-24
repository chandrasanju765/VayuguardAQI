import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "../../components/ui/button";
import AddOrEditTemplateModal from "./AddOrEditTemplateModal";
import { ConfirmationModal } from "../../components/ui/modal";
import { selectedTemplateAtom } from "./jotai";
import { useState } from "react";
import { deleteTemplate } from "../../data/mutations";
import { toast } from "react-hot-toast";

const TemplatesHeader = () => {
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom);
  const [isAddOrEditTemplateModalOpen, setIsAddOrEditTemplateModalOpen] =
    useState(false);
  const [isDeleteTemplateModalOpen, setIsDeleteTemplateModalOpen] =
    useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDeleteTemplate = async (_id: string) => {
    try {
      setIsDeleteInProgress(true);
      const response = await deleteTemplate(_id);
      if (response.status === 200) {
        setIsDeleteTemplateModalOpen(false);
        toast.success("Template deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete template");
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1">Templates</h1>
          <p className="text-sm h-4 text-gray-600">
            {selectedTemplate ? (
              <>
                Selected:{" "}
                <span className="font-medium text-cyan-700">
                  {selectedTemplate.title}
                </span>
              </>
            ) : (
              <span className="font-medium text-gray-500">
                No template selected
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
              setIsAddOrEditTemplateModalOpen(true);
            }}
            disabled={!selectedTemplate}
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-gray-500 border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsDeleteTemplateModalOpen(true)}
            disabled={!selectedTemplate}
          >
            <Trash2Icon />
            Delete
          </Button>
          <Button
            className="bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600"
            onClick={() => setIsAddOrEditTemplateModalOpen(true)}
          >
            <PlusIcon />
            Template
          </Button>
        </div>
      </div>

      {isAddOrEditTemplateModalOpen && (
        <AddOrEditTemplateModal
          isOpen={isAddOrEditTemplateModalOpen}
          onClose={() => {
            setIsAddOrEditTemplateModalOpen(false);
            setSelectedTemplate(null);
            setIsEditMode(false);
          }}
          isEdit={isEditMode}
          templateData={isEditMode ? selectedTemplate : undefined}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteTemplateModalOpen}
        onClose={() => {
          setIsDeleteTemplateModalOpen(false);
          setSelectedTemplate(null);
        }}
        onConfirm={() => handleDeleteTemplate(selectedTemplate?._id as string)}
        title={`Delete Template`}
        description={`Are you sure you want to delete "${
          selectedTemplate?.title || "this template"
        }"? This will remove all associated data and cannot be undone.`}
        confirmText="Delete Template"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleteInProgress}
      />
    </>
  );
};

export default TemplatesHeader;
