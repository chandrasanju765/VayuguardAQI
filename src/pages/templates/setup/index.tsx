import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import TemplateSetupHeader from "./TemplateSetupHeader";
import FileUpload from "./FileUpload";
import ComparisonScaleFrame from "./frames/Frame3";
import TemplateSetupFooter from "./TemplateSetupFooter";
import IndoorAQIFrame from "./frames/Frame1";
import { ComparisonFrame } from "./frames/Frame4";
import OutdoorAQIFrame from "./frames/Frame2";
import { saveTemplate } from "../../../data/mutations";
import {
  useGetTemplateById,
  useGetAQIDevices,
  useGetAQILogsHistoryByDeviceID,
  useGetOutdoorAQIData,
  useGetRealtimeAQIData, 
} from "../../../data/cachedQueries";
import toast from "react-hot-toast";
import BlankCanvas from "./frames/BlankCanvas";
import dayjs from "dayjs";
import type { AQIDevice } from "../../../models/AQIDevices";

interface MediaFile {
  id: string;
  file?: File;
  thumbnailUrl?: string;
  frameUrl?: string;
  name: string;
  type: "image" | "video";
  isExisting?: boolean;
}

interface CanvasImage {
  id: string;
  url: string;
  sourceUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CustomCanvas {
  id: string;
  name: string;
  image?: CanvasImage;
}

const SetupTemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const templateId = params.get("templateId");
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tmpl-1");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [customCanvases, setCustomCanvases] = useState<CustomCanvas[]>([]);
  const [isSlideshow, setIsSlideshow] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(10);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [removedFrameIds, setRemovedFrameIds] = useState<number[]>([]);
  const slideshowIntervalRef = useRef<number | null>(null);
  // Track which predefined frames are currently selected to show
  const [currentDefaultFrames, setCurrentDefaultFrames] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);

  // Template-to-frames mapping for dropdown selection
  const TEMPLATE_TO_FRAMES: Record<string, number[]> = {
    "tmpl-1": [1, 2, 3, ],
    "tmpl-2": [ 4],
    "tmpl-3": [1, 2, 3, 5],
  };

  // Helpers for predefined frames
  const getAvailablePredefinedIds = (): number[] => {
    return currentDefaultFrames.filter((id) => !removedFrameIds.includes(id));
  };

  const getFirstAvailablePredefinedId = (): number | null => {
    const ids = getAvailablePredefinedIds();
    return ids.length > 0 ? ids[0] : null;
  };

  const getFirstAvailableSlideId = (
    includeBlankCanvases: boolean = true
  ): number | null => {
    const firstPre = getFirstAvailablePredefinedId();
    if (firstPre !== null) return firstPre;
    // fall back to first canvas if any
    const canvasIds = getAvailableCanvasIds(includeBlankCanvases);
    return canvasIds.length > 0 ? canvasIds[0] : null;
  };

  const getAvailableCanvasIds = (
    includeBlankCanvases: boolean = true
  ): number[] =>
    customCanvases
      .map((canvas, index) => ({
        id: 1000 + index,
        hasImage: !!canvas.image,
      }))
      .filter((c) => (includeBlankCanvases ? true : c.hasImage))
      .map((c) => c.id);

  const getAvailableSlideIds = (
    includeBlankCanvases: boolean = true
  ): number[] => [
    ...getAvailablePredefinedIds(),
    ...getAvailableCanvasIds(includeBlankCanvases),
  ];

  const getNextAvailableSlideId = (
    current: number | null,
    includeBlankCanvases: boolean = true
  ): number => {
    const ids = getAvailableSlideIds(includeBlankCanvases);
    if (ids.length === 0) return 0; // placeholder
    if (current === null) return ids[0];
    const idx = ids.indexOf(current);
    if (idx === -1) return ids[0];
    return ids[(idx + 1) % ids.length];
  };

  const handleSaveTemplate = async () => {
    if (!templateId) {
      toast.error("No template ID provided");
      return;
    }

    if (!templateData) {
      toast.error("Template data not loaded");
      return;
    }

    try {
      // Extract thumbnail URLs from all media files
      const thumbnailUrls = mediaFiles
        .filter((media) => media.thumbnailUrl)
        .map((media) => {
          // Remove API base URL for existing template media, keep as-is for uploaded media
          return media.isExisting
            ? media.thumbnailUrl!.replace(import.meta.env.VITE_API_BASE_URL, "")
            : media.thumbnailUrl!;
        });

      // Extract frame URLs from all media files
      const frameUrls = mediaFiles
        .filter((media) => media.frameUrl)
        .map((media) => {
          // Remove API base URL for existing template media, keep as-is for uploaded media
          return media.isExisting
            ? media.frameUrl!.replace(import.meta.env.VITE_API_BASE_URL, "")
            : media.frameUrl!;
        });

      // Use currentDefaultFrames (kept in sync with dropdown and removals)
      const defaultFrames = currentDefaultFrames.filter(
        (frameId) => !removedFrameIds.includes(frameId)
      );

      // Process canvas image to remove API base URL if present
      const processedCanvases = customCanvases.map((canvas) => ({
        ...canvas,
        image: canvas.image
          ? {
              ...canvas.image,
              url: canvas.image.url.startsWith(
                import.meta.env.VITE_API_BASE_URL
              )
                ? canvas.image.url.replace(
                    import.meta.env.VITE_API_BASE_URL,
                    ""
                  )
                : canvas.image.url,
              sourceUrl: canvas.image.sourceUrl?.startsWith(
                import.meta.env.VITE_API_BASE_URL
              )
                ? canvas.image.sourceUrl.replace(
                    import.meta.env.VITE_API_BASE_URL,
                    ""
                  )
                : canvas.image.sourceUrl,
            }
          : undefined,
      }));

      // Create new template structure
      const templateBody = {
        thumbnails: thumbnailUrls,
        frames: frameUrls,
        defaultFrames: defaultFrames,
        canvases: processedCanvases,
      };

      await saveTemplate({
        _id: templateId,
        body: {
          colorStandard: templateData.colorStandard || "WHO",
          template: templateBody,
        },
      });

      // Refresh template data after saving
      mutateTemplate();

      toast.success("Template saved successfully!");
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template. Please try again.");
    }
  };

  // Fetch template data
  const {
    data: templateData,
    error: templateError,
    isLoading: templateLoading,
    mutate: mutateTemplate,
  } = useGetTemplateById(templateId);

  // Fetch all devices
  const { data: devicesData } = useGetAQIDevices();
  const devices: AQIDevice[] = useMemo(() => {
    const devicesRaw = (devicesData as any) || [];
    return Array.isArray(devicesRaw)
      ? devicesRaw
      : Array.isArray(devicesRaw?.data)
      ? (devicesRaw.data as AQIDevice[])
      : [];
  }, [devicesData]);

  // FIXED: Get the device ID correctly
  const templateDeviceId = useMemo(() => {
    if (!templateData?.deviceId) return null;
    return (templateData.deviceId as string) || null;
  }, [templateData]);

  // FIXED: Find the device by _id (not mid)
  const templateDevice = useMemo(() => {
    if (!templateDeviceId) return null;
    return devices.find((device) => device._id === templateDeviceId) || null;
  }, [templateDeviceId, devices]);

  // FIXED: Use deviceId from the device object (not mid)
  const deviceMid = useMemo(() => {
    return templateDevice?.deviceId || null;
  }, [templateDevice]);

  console.log("=== DEVICE DEBUG ===");
  console.log("Template deviceId:", templateDeviceId);
  console.log("Found device:", templateDevice);
  console.log("Device MID (deviceId):", deviceMid);
  console.log("All devices:", devices);
  console.log("===========================");

  // Outdoor API state
  const outdoorAPIState = useMemo(() => {
    const state = templateDevice?.outdoorAPIState;
    return state && typeof state === "string" && state.trim() !== "" ? state : null;
  }, [templateDevice]);

  // Date range
  const { startDate, endDate } = useMemo(() => {
    const today = dayjs();
    const start = today.subtract(1, 'day');
    return {
      startDate: start.format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD'),
    };
  }, []);

  // FIXED: Use deviceMid for both real-time and historical data
  const {
    data: realtimeAQIData,
    error: realtimeAQIError,
    isLoading: realtimeAQILoading,
  } = useGetRealtimeAQIData(deviceMid);

  const {
    data: aqiLogsHistory,
    error: aqiLogsError,
    isLoading: aqiLogsLoading,
  } = useGetAQILogsHistoryByDeviceID({
    deviceId: deviceMid,
    startDate,
    endDate,
  });

  // Fetch outdoor AQI data
  const {
    data: outdoorAQIData,
    isLoading: outdoorLoading,
    error: outdoorError,
  } = useGetOutdoorAQIData(outdoorAPIState);

  // Function to convert template thumbnails and frames to MediaFile objects
  const convertTemplateMediaToObjects = (
    thumbnails: string[],
    frames: string[]
  ): MediaFile[] => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    return thumbnails.map((thumbnailPath, index) => {
      // Handle both relative and absolute URLs for thumbnails
      const thumbnailUrl = thumbnailPath.startsWith("http")
        ? thumbnailPath
        : `${apiBaseUrl}${thumbnailPath}`;

      // Handle both relative and absolute URLs for frames
      const frameUrl = frames[index]
        ? frames[index].startsWith("http")
          ? frames[index]
          : `${apiBaseUrl}${frames[index]}`
        : undefined;

      // Determine file type from frame URL or thumbnail URL
      const urlToCheck = frameUrl || thumbnailUrl;
      const extension = urlToCheck.split(".").pop()?.toLowerCase() || "";
      const isVideo = ["mp4", "webm", "ogg", "avi", "mov"].includes(extension);

      return {
        id: `template-${index}`,
        thumbnailUrl: thumbnailUrl,
        frameUrl: frameUrl,
        name: isVideo ? "Video" : "Image",
        type: isVideo ? "video" : "image",
        isExisting: true,
      };
    });
  };

  // Effect to populate templateMedia when templateData loads
  useEffect(() => {
    if (templateData?.template && templateData.template.thumbnails) {
      // Extract thumbnails and frames from new template structure
      const thumbnails = templateData.template.thumbnails;
      const frames = templateData.template.frames || [];

      if (thumbnails.length > 0) {
        const media = convertTemplateMediaToObjects(thumbnails, frames);
        setMediaFiles(media);
      } else {
        setMediaFiles([]);
      }
    } else {
      setMediaFiles([]);
    }

    // Load custom canvases if they exist
    if (
      templateData?.template?.canvases &&
      Array.isArray(templateData.template.canvases)
    ) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const loadedCanvases = templateData.template.canvases.map(
        (canvas: CustomCanvas) => ({
          ...canvas,
          image: canvas.image
            ? {
                ...canvas.image,
                url: canvas.image.url.startsWith("http")
                  ? canvas.image.url
                  : `${apiBaseUrl}${canvas.image.url}`,
                sourceUrl: canvas.image.sourceUrl
                  ? canvas.image.sourceUrl.startsWith("http")
                    ? canvas.image.sourceUrl
                    : `${apiBaseUrl}${canvas.image.sourceUrl}`
                  : undefined,
              }
            : undefined,
        })
      );

      setCustomCanvases(loadedCanvases);
    } else {
      setCustomCanvases([]);
    }

    // Reset removed frames when template data changes
    setRemovedFrameIds([]);
    // Initialize currentDefaultFrames from backend if available; otherwise from selection
    if (
      templateData?.template?.defaultFrames &&
      templateData.template.defaultFrames.length > 0
    ) {
      setCurrentDefaultFrames(templateData.template.defaultFrames);
    } else {
      setCurrentDefaultFrames(
        TEMPLATE_TO_FRAMES[selectedTemplate] || [1, 2, 3, 4, 5]
      );
    }

    // After setting frames, ensure active slide is valid; otherwise select placeholder (0)
    const first = (
      templateData?.template?.defaultFrames &&
      templateData.template.defaultFrames.length > 0
        ? templateData.template.defaultFrames
        : TEMPLATE_TO_FRAMES[selectedTemplate] || [1, 2, 3, 4, 5]
    ).find((id) => !removedFrameIds.includes(id));
    if (!first) {
      setActiveSlide(0);
    } else if (
      activeSlide < 1 ||
      activeSlide > 5 ||
      removedFrameIds.includes(activeSlide)
    ) {
      setActiveSlide(first);
    }
  }, [templateData]);

  // Handle template change from header dropdown
  const handleTemplateChange = (value: string | null) => {
    if (value) {
      setSelectedTemplate(value);
      // Refresh default frames to match the selected template type
      setCurrentDefaultFrames(TEMPLATE_TO_FRAMES[value] || [1, 2, 3, 4, 5]);
    }
    // Reset removed frames when template changes so all frames for the template come back
    setRemovedFrameIds([]);
    // Reset to first available slide or placeholder
    const first = (
      TEMPLATE_TO_FRAMES[value || selectedTemplate] || [1, 2, 3, 4, 5]
    ).find((id) => !removedFrameIds.includes(id));
    setActiveSlide(first ?? 0);
    // If slideshow is running, restart it
    if (isSlideshow) {
      stopSlideshow();
      startSlideshow();
    }
  };

  // Filter predefined slides based on currentDefaultFrames
  const getFilteredPredefinedSlides = () => {
    const allSlides = [
      {
        id: 1,
        component: (
          <div className="w-[900px] h-[500px] overflow-hidden">
              <IndoorAQIFrame
              aqiData={realtimeAQIData}
              isLoading={realtimeAQILoading}
            />
          </div>
        ),
        name: "Frame 1",
        thumbnail: "/frame-1.png",
      },
      {
        id: 2,
        component: (
          <div className="w-[900px] h-[500px] overflow-hidden">
            <OutdoorAQIFrame
              outdoorAQIData={outdoorAQIData}
              outdoorLoading={outdoorLoading}
              outdoorError={outdoorError}
            />
          </div>
        ),
        name: "Frame 2",
        thumbnail: "/frame-1.png",
      },
      {
        id: 3,
          component: (
            <div className="w-[900px] h-[500px] overflow-hidden">
              <ComparisonScaleFrame
                aqiData={aqiLogsHistory} // Keep historical as fallback
                realtimeAQIData={realtimeAQIData} // Add real-time data
                isLoading={realtimeAQILoading || aqiLogsLoading} // Combine loading states
                error={realtimeAQIError || aqiLogsError} // Combine errors
                outdoorAQIData={outdoorAQIData}
                outdoorLoading={outdoorLoading}
                outdoorError={outdoorError}
              />
            </div>
          ),
        name: "Frame 3",
        thumbnail: "/frame-3.png",
      },
      {
        id: 4,
        component: (
          <div className="w-[900px] h-[500px] overflow-hidden">
            <ComparisonFrame
              aqiData={aqiLogsHistory}
              isLoading={aqiLogsLoading}
              error={aqiLogsError}
              outdoorAQIData={outdoorAQIData}
              outdoorLoading={outdoorLoading}
              outdoorError={outdoorError}
            />
          </div>
        ),
        name: "Frame 4",
        thumbnail: "/frame-4.png",
      },
      {
        id: 5,
        component: (
    <div className="w-[900px] h-[500px] overflow-hidden">
      <ComparisonFrame
        aqiData={aqiLogsHistory}
        realtimeAQIData={realtimeAQIData} // Make sure this is passed
        isLoading={realtimeAQILoading || aqiLogsLoading}
        error={realtimeAQIError || aqiLogsError}
        outdoorAQIData={outdoorAQIData}
        outdoorLoading={outdoorLoading}
        outdoorError={outdoorError}
      />
    </div>
  ),
        name: "Frame 5",
        thumbnail: "/frame-5.png",
      },
    ];

    // Use currentDefaultFrames (kept in sync with backend or selection)
    const framesToInclude: number[] = currentDefaultFrames;

    return allSlides.filter(
      (slide) =>
        framesToInclude.includes(slide.id) &&
        !removedFrameIds.includes(slide.id)
    );
  };

  const getMaxSlideId = () => {
    const predefined = getFilteredPredefinedSlides();
    const maxPredefinedId =
      predefined.length > 0 ? Math.max(...predefined.map((s) => s.id)) : 0;
    const maxCanvasId =
      customCanvases.length > 0 ? 1000 + (customCanvases.length - 1) : 0;
    return Math.max(maxPredefinedId, maxCanvasId);
  };

  // Slideshow functions
  const startSlideshow = () => {
    setIsSlideshow(true);
    slideshowIntervalRef.current = window.setInterval(() => {
      setActiveSlide((prev) => getNextAvailableSlideId(prev, true));
    }, slideDuration * 1000);
  };

  const stopSlideshow = () => {
    setIsSlideshow(false);
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  };

  const toggleSlideshow = () => {
    if (isSlideshow) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };

  // Handle manual slide change during slideshow
  const handleSlideChange = (slideId: number) => {
    setActiveSlide(slideId);
    // If slideshow is running, restart the interval from this slide
    if (isSlideshow) {
      stopSlideshow();
      startSlideshow();
    }
  };

  // Handle duration change
  const handleDurationChange = (duration: number) => {
    setSlideDuration(duration);
    // If slideshow is running, restart it with new duration
    if (isSlideshow) {
      stopSlideshow();
      // Use setTimeout to start with new duration after current interval is cleared
      setTimeout(() => {
        setIsSlideshow(true);
        slideshowIntervalRef.current = window.setInterval(() => {
          setActiveSlide((prev) => {
            const maxSlideId = getMaxSlideId();
            return prev >= maxSlideId ? 1 : prev + 1;
          });
        }, duration * 1000);
      }, 100);
    }
  };

  const handleMediaUpload = (media: MediaFile) => {
    setMediaFiles((prev) => [...prev, media]);
  };

  const handleMediaRemove = (mediaId: string) => {
    setMediaFiles((prev) => {
      const mediaToRemove = prev.find((m) => m.id === mediaId);
      if (mediaToRemove && !mediaToRemove.isExisting && mediaToRemove.file) {
        // Clean up the URL object for uploaded media (not template media)
        URL.revokeObjectURL(URL.createObjectURL(mediaToRemove.file));
      }
      return prev.filter((m) => m.id !== mediaId);
    });

    // Track removed media IDs to sync with FileUpload component
    setRemovedMediaIds((prev) => [...prev, mediaId]);
  };

  const handleFrameRemove = (frameId: number) => {
    setRemovedFrameIds((prev) => [...prev, frameId]);
    // Remove from currentDefaultFrames so it doesn't come back on save
    setCurrentDefaultFrames((prev) => prev.filter((id) => id !== frameId));
    if (activeSlide === frameId) {
      const next = getFirstAvailablePredefinedId();
      setActiveSlide(next ?? 0);
    }
  };

  const handleAddCanvas = () => {
    if (customCanvases.length >= 10) {
      toast.error("Maximum 10 blank canvases allowed");
      return;
    }

    const newCanvas: CustomCanvas = {
      id: `canvas-${Date.now()}`,
      name: `Canvas ${customCanvases.length + 1}`,
    };
    setCustomCanvases((prev) => [...prev, newCanvas]);
    const newSlideId = 1000 + customCanvases.length;
    setActiveSlide(newSlideId);
  };

  const handleCanvasImageChange = (
    canvasId: string,
    image: CanvasImage | undefined
  ) => {
    setCustomCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === canvasId ? { ...canvas, image } : canvas
      )
    );
  };

  const handleSidebarMediaClick = (media: MediaFile) => {
    if (!(activeSlide >= 1000)) return;
    const canvasIndex = activeSlide - 1000;
    if (canvasIndex < 0 || canvasIndex >= customCanvases.length) return;
    if (media.type !== "image") return;

    const rectWidth = 849;
    const rectHeight = 483;
    const imgEl = new Image();
    const url = media.frameUrl || media.thumbnailUrl || "";
    if (!url) return;
    imgEl.onload = () => {
      // Fit to full canvas while preserving aspect ratio
      const fitScale = Math.min(
        rectWidth / imgEl.naturalWidth,
        rectHeight / imgEl.naturalHeight
      );
      const width = imgEl.naturalWidth * fitScale;
      const height = imgEl.naturalHeight * fitScale;

      const newImg: CanvasImage = {
        id: `img-${Date.now()}-${Math.random()}`,
        url,
        sourceUrl: media.frameUrl || media.thumbnailUrl || url,
        x: (rectWidth - width) / 2,
        y: (rectHeight - height) / 2,
        width,
        height,
      };
      const targetCanvasId = customCanvases[canvasIndex].id;
      handleCanvasImageChange(targetCanvasId, newImg);
    };
    imgEl.src = url;
  };

  const handleCanvasRemove = (canvasId: string) => {
    setCustomCanvases((prev) => prev.filter((c) => c.id !== canvasId));
    const canvasIndex = customCanvases.findIndex((c) => c.id === canvasId);
    if (activeSlide === 1000 + canvasIndex) {
      const first = getFirstAvailableSlideId();
      setActiveSlide(first ?? 0);
    }
  };

  const handlePreview = () => {
    const availableFrames = currentDefaultFrames.filter(
      (frameId) => !removedFrameIds.includes(frameId)
    );
    const canvasesWithImages = customCanvases.filter(
      (canvas) => !!canvas.image
    );

    navigate("/preview", {
      state: {
        defaultFrames: availableFrames,
        customCanvases: canvasesWithImages,
        slideDuration,
        outdoorAPIState,
      },
    });
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => {
        if (!media.isExisting && media.file) {
          URL.revokeObjectURL(URL.createObjectURL(media.file));
        }
      });
    };
  }, [mediaFiles]);

  useEffect(() => {
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSlideshow) {
        stopSlideshow();
      }
      if (event.key === " " && event.ctrlKey) {
        event.preventDefault();
        toggleSlideshow();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSlideshow]);

  // Handle activeSlide validation when template or slides change
  useEffect(() => {
    const maxSlideId = getMaxSlideId();

    // If current active slide is beyond the available slides, reset to first slide
    if (activeSlide > maxSlideId && maxSlideId > 0) {
      const first = getFirstAvailablePredefinedId();
      setActiveSlide(first ?? 0);
    }

    // If current active slide is a removed frame, reset to first slide
    if (removedFrameIds.includes(activeSlide) && maxSlideId > 0) {
      const first = getFirstAvailablePredefinedId();
      setActiveSlide(first ?? 0);
    }
  }, [templateData, mediaFiles.length, activeSlide, removedFrameIds]);

  // Get filtered predefined slides based on template data
  const predefinedSlides = getFilteredPredefinedSlides();

  const renderCurrentSlide = () => {
    const validIds = currentDefaultFrames.filter(
      (id) => !removedFrameIds.includes(id)
    );
    const isPredefined = activeSlide >= 1 && activeSlide <= 5;
    if (
      (activeSlide === 0 ||
        (isPredefined && !validIds.includes(activeSlide))) &&
      activeSlide < 1000
    ) {
      return (
        <div className="w-[900px] h-[500px] flex items-center justify-center bg-white text-gray-500">
          Select a thumbnail to be rendered here
        </div>
      );
    }

    if (
      activeSlide >= 1 &&
      activeSlide <= 5 &&
      !removedFrameIds.includes(activeSlide)
    ) {
      const predefinedSlides = getFilteredPredefinedSlides();
      const slide = predefinedSlides.find((s) => s.id === activeSlide);

      return (
        slide?.component || (
          <IndoorAQIFrame aqiData={aqiLogsHistory} isLoading={aqiLogsLoading} />
        )
      );
    }

    if (activeSlide >= 1000) {
      const canvasIndex = activeSlide - 1000;
      if (canvasIndex >= 0 && canvasIndex < customCanvases.length) {
        const canvas = customCanvases[canvasIndex];

        return <BlankCanvas image={canvas.image} isPreview={false} />;
      }
    }

    return (
      <IndoorAQIFrame aqiData={aqiLogsHistory} isLoading={aqiLogsLoading} />
    );
  };

  const currentSlide = renderCurrentSlide();

  const slides = [
    ...predefinedSlides,
    ...customCanvases.map((canvas, index) => ({
      id: 1000 + index,
      name: canvas.name,
      thumbnail: canvas.image
        ? canvas.image.url
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3E+%3C/text%3E%3C/svg%3E",
      isMedia: false,
      isCanvas: true,
      canvasId: canvas.id,
    })),
  ];

  // Show loading state while template is being fetched
  if (templateLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  // Show error state if template failed to load
  if (templateError) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load template
          </h3>
          <p className="text-gray-600 mb-4">
            {templateError.message ||
              "An error occurred while loading the template"}
          </p>
          <button
            onClick={() => mutateTemplate()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error if no template ID provided
  if (!templateId) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No template ID provided
          </h3>
          <p className="text-gray-600">
            Please provide a valid template ID in the URL parameters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
          <TemplateSetupHeader
            defaultValue={selectedTemplate}
            onChange={handleTemplateChange}
            onToggleSlideshow={toggleSlideshow}
            isSlideshow={isSlideshow}
            slideDuration={slideDuration}
            onDurationChange={handleDurationChange}
            onSave={handleSaveTemplate}
            onPreview={handlePreview}
          />
        </div>

        <div className="flex-1 overflow-hidden bg-gray-100 min-h-0">
          <div className="w-full h-full flex items-center justify-center p-6 relative">
            <div className="flex items-center justify-center rounded-lg shadow-lg bg-white">
              {currentSlide}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 flex-shrink-0 min-w-0">
          <TemplateSetupFooter
            slides={slides}
            activeSlide={activeSlide}
            onSlideSelect={handleSlideChange}
            onMediaRemove={handleMediaRemove}
            onFrameRemove={handleFrameRemove}
            onAddCanvas={handleAddCanvas}
            onCanvasRemove={handleCanvasRemove}
          />
        </div>
      </div>

      <div className="w-56 bg-white border-l border-gray-200 shadow-lg flex-shrink-0">
        <FileUpload
          onMediaUpload={handleMediaUpload}
          onMediaRemove={handleMediaRemove}
          externallyRemovedMediaIds={removedMediaIds}
          onSidebarMediaClick={handleSidebarMediaClick}
        />
      </div>
    </div>
  );
};

export default SetupTemplatePage;
