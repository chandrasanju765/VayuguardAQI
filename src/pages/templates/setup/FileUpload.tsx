import React, { useState, useRef, useCallback } from "react";
import { uploadFile } from "../../../data/mutations";
import {
  Upload,
  X,
  Image,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
  thumbnailUrl?: string;
  frameUrl?: string;
}

interface MediaFile {
  id: string;
  file: File;
  thumbnailUrl?: string;
  frameUrl?: string; // URL for the actual frame/file
  name: string;
  type: "image" | "video";
}

interface FileUploadProps {
  onMediaUpload: (media: MediaFile) => void; // keep to update uploaded list in parent
  onMediaRemove: (mediaId: string) => void;
  externallyRemovedMediaIds?: string[];
  onSidebarMediaClick?: (media: MediaFile) => void; // NEW: add to active canvas
}

const FileUpload: React.FC<FileUploadProps> = ({
  onMediaUpload,
  onMediaRemove,
  externallyRemovedMediaIds = [],
  onSidebarMediaClick,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when files are removed externally
  React.useEffect(() => {
    if (externallyRemovedMediaIds.length > 0) {
      setUploadedFiles((prev) =>
        prev.filter((file) => !externallyRemovedMediaIds.includes(file.id))
      );
    }
  }, [externallyRemovedMediaIds]);

  // Supported file types
  const supportedTypes = {
    image: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    video: ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"],
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    const allSupportedTypes = [
      ...supportedTypes.image,
      ...supportedTypes.video,
    ];

    if (!allSupportedTypes.includes(file.type)) {
      return "File type not supported. Please upload images (JPEG, PNG, GIF, WebP, SVG) or videos (MP4, WebM, OGG, AVI, MOV).";
    }

    if (file.size > maxFileSize) {
      return "File size too large. Maximum size is 50MB.";
    }

    return null;
  };

  const getFileIcon = (fileType: string) => {
    if (supportedTypes.image.includes(fileType)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (supportedTypes.video.includes(fileType)) {
      return <Video className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const validationError = validateFile(file);
      const fileId = Math.random().toString(36).substring(7);

      if (validationError) {
        toast.error(validationError);
        continue;
      }

      // Add file to state with uploading status
      const uploadedFile: UploadedFile = {
        file,
        id: fileId,
        status: "uploading",
        progress: 0,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      try {
        // Simulate upload progress (since the API doesn't provide progress events)
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId && f.status === "uploading"
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 200);

        // Upload the file
        const uploadResponse = await uploadFile(file);

        // Clear progress interval and mark as success
        clearInterval(progressInterval);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  thumbnailUrl: uploadedFileData?.thumbnailUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${
                        uploadedFileData.thumbnailUrl
                      }`
                    : undefined,
                  frameUrl: uploadedFileData?.frameUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${
                        uploadedFileData.frameUrl
                      }`
                    : undefined,
                }
              : f
          )
        );

        // Create media object and notify parent (store in sidebar only)
        const mediaType: "image" | "video" = supportedTypes.image.includes(
          file.type
        )
          ? "image"
          : "video";
        const uploadedFileData = uploadResponse.files[0]; // Get the first (and only) file from response
        const media: MediaFile = {
          id: fileId,
          file,
          thumbnailUrl: uploadedFileData?.thumbnailUrl
            ? `${import.meta.env.VITE_API_BASE_URL}${
                uploadedFileData.thumbnailUrl
              }`
            : undefined,
          frameUrl: uploadedFileData?.frameUrl
            ? `${import.meta.env.VITE_API_BASE_URL}${uploadedFileData.frameUrl}`
            : undefined, // Store the actual frame URL from backend
          name: file.name,
          type: mediaType,
        };
        onMediaUpload(media);

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );

        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    // Find the uploaded file to get its status
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);

    // Remove from local state
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

    // If file was successfully uploaded, notify parent to remove from media
    if (fileToRemove && fileToRemove.status === "success") {
      onMediaRemove(fileId);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = "";
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold mb-2">Upload Files</h3>
        <p className="text-xs text-gray-600">
          Upload images and videos for your template
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 mb-6
            ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3">
            <Upload
              className={`w-10 h-10 ${
                isDragOver ? "text-primary" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-xs font-medium">
                {isDragOver ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or{" "}
                <span className="text-primary font-medium">
                  click to browse
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* File format info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-800 font-medium mb-1">
            Supported formats:
          </p>
          <p className="text-xs text-blue-600">
            Images: JPEG, PNG, GIF, WebP, SVG
            <br />
            Videos: MP4, WebM, OGG, AVI, MOV
            <br />
            Maximum size: 50MB per file
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-xs">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg border cursor-pointer"
                  onClick={() => {
                    if (uploadedFile.status !== "success") return;
                    const media: MediaFile = {
                      id: uploadedFile.id,
                      file: uploadedFile.file,
                      name: uploadedFile.file.name,
                      type: supportedTypes.image.includes(
                        uploadedFile.file.type
                      )
                        ? "image"
                        : "video",
                      thumbnailUrl: uploadedFile.thumbnailUrl,
                      frameUrl: uploadedFile.frameUrl,
                    };
                    onSidebarMediaClick?.(media);
                  }}
                  title={
                    uploadedFile.status === "success"
                      ? "Click to add to active canvas"
                      : undefined
                  }
                >
                  <div className="flex-shrink-0 mr-3">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                      </div>

                      <div className="flex items-center ml-2">
                        {uploadedFile.status === "uploading" && (
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-1 mr-2">
                              <div
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${uploadedFile.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">
                              {uploadedFile.progress}%
                            </span>
                          </div>
                        )}

                        {uploadedFile.status === "success" && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}

                        {uploadedFile.status === "error" && (
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                            <span
                              className="text-xs text-red-600"
                              title={uploadedFile.error}
                            >
                              Failed
                            </span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(uploadedFile.id);
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
