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
  useGetLatestAQILogByDevice,
} from "../../../data/cachedQueries";
import toast from "react-hot-toast";
import BlankCanvas from "./frames/BlankCanvas";
import dayjs from "dayjs";
import type { AQIDevice } from "../../../models/AQIDevices";
import { getCurrentUser } from "../../../utils";

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

  const [currentDefaultFrames, setCurrentDefaultFrames] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);

  const TEMPLATE_TO_FRAMES: Record<string, number[]> = {
    "tmpl-1": [1, 2, 3],
    "tmpl-2": [4],
    "tmpl-3": [1, 2, 3, 5],
  };

  const {
    data: templateData,
    isLoading: templateLoading,
    error: templateError,
    mutate: mutateTemplate,
  } = useGetTemplateById(templateId);

  const { data: devicesData } = useGetAQIDevices();
  const devices: AQIDevice[] = useMemo(() => {
    const raw = devicesData || [];
    return Array.isArray(raw) ? raw : raw?.data || [];
  }, [devicesData]);

  const templateDeviceId = templateData?.deviceId || null;

  const templateDevice = useMemo(() => {
    if (!templateDeviceId) return null;
    return devices.find((d) => d._id === templateDeviceId) || null;
  }, [templateDeviceId, devices]);

  const deviceMid = templateDevice?.deviceId || null;

  console.log("DEVICE MID SELECTED:", deviceMid);


  const outdoorAPIState = useMemo(() => {
    const x = templateDevice?.outdoorAPIState;
    return x && x.trim() !== "" ? x : null;
  }, [templateDevice]);

  // ---------------------------------
  // 1️⃣ GET LATEST AQI LOG (correct API)
  // ---------------------------------
  const authData = getCurrentUser();
 const roleOrUserId: string = authData?.role === "admin"
  ? "admin"
  : authData?._id || "user";


  const {
    data: latestAQIData,
    isLoading: latestAQILoading,
    error: latestAQIError,
  } = useGetLatestAQILogByDevice(deviceMid, roleOrUserId);

  // ---------------------------------
  // 2️⃣ GET HISTORY (for Frame 3, Frame 4, Frame 5)
  // ---------------------------------
  const today = dayjs();
  const startDate = today.subtract(1, "day").format("YYYY-MM-DD");
  const endDate = today.format("YYYY-MM-DD");

  const {
    data: aqiLogsHistory,
    isLoading: aqiLogsLoading,
    error: aqiLogsError,
  } = useGetAQILogsHistoryByDeviceID({ deviceId: deviceMid, startDate, endDate });

  // ---------------------------------
  // 3️⃣ OUTDOOR API
  // ---------------------------------
  const {
    data: outdoorAQIData,
    isLoading: outdoorLoading,
    error: outdoorError,
  } = useGetOutdoorAQIData(outdoorAPIState);

  // ---------------------------------
  // Helper functions for slides/canvases
  // ---------------------------------
  const getAvailablePredefinedIds = () =>
    currentDefaultFrames.filter((id) => !removedFrameIds.includes(id));

  const getFirstAvailablePredefinedId = () => {
    const ids = getAvailablePredefinedIds();
    return ids.length > 0 ? ids[0] : null;
  };

  const getAvailableCanvasIds = (includeBlank = true) =>
    customCanvases
      .map((c, i) => ({
        id: 1000 + i,
        hasImage: !!c.image,
      }))
      .filter((x) => (includeBlank ? true : x.hasImage))
      .map((x) => x.id);

  const getAvailableSlideIds = (includeBlank = true) => [
    ...getAvailablePredefinedIds(),
    ...getAvailableCanvasIds(includeBlank),
  ];

  const getNextAvailableSlideId = (
    current: number | null,
    includeBlank = true
  ) => {
    const ids = getAvailableSlideIds(includeBlank);
    if (ids.length === 0) return 0;
    if (current === null) return ids[0];
    const idx = ids.indexOf(current);
    return idx === -1 ? ids[0] : ids[(idx + 1) % ids.length];
  };

  // ---------------------------------
  // Save Template
  // ---------------------------------
  const handleSaveTemplate = async () => {
    if (!templateId) return toast.error("No template ID provided");
    if (!templateData) return toast.error("Template data not loaded");

    try {
      const thumbnailUrls = mediaFiles
        .filter((m) => m.thumbnailUrl)
        .map((m) =>
          m.isExisting
            ? m.thumbnailUrl!.replace(import.meta.env.VITE_API_BASE_URL, "")
            : m.thumbnailUrl!
        );

      const frameUrls = mediaFiles
        .filter((m) => m.frameUrl)
        .map((m) =>
          m.isExisting
            ? m.frameUrl!.replace(import.meta.env.VITE_API_BASE_URL, "")
            : m.frameUrl!
        );

      const defaultFrames = currentDefaultFrames.filter(
        (id) => !removedFrameIds.includes(id)
      );

      const processedCanvases = customCanvases.map((canvas) => ({
        ...canvas,
        image: canvas.image
          ? {
              ...canvas.image,
              url: canvas.image.url.replace(import.meta.env.VITE_API_BASE_URL, ""),
              sourceUrl: canvas.image.sourceUrl?.replace(
                import.meta.env.VITE_API_BASE_URL,
                ""
              ),
            }
          : undefined,
      }));

      await saveTemplate({
        _id: templateId,
        body: {
          colorStandard: templateData.colorStandard || "WHO",
          template: {
            thumbnails: thumbnailUrls,
            frames: frameUrls,
            defaultFrames,
            canvases: processedCanvases,
          },
        },
      });

      mutateTemplate();
      toast.success("Template saved successfully!");
    } catch (err) {
      console.error("Failed to save template:", err);
      toast.error("Failed to save template.");
    }
  };

  // ---------------------------------
  // Load template media + canvases
  // ---------------------------------
  useEffect(() => {
    if (templateData?.template?.thumbnails) {
      const thumbnails = templateData.template.thumbnails;
      const frames = templateData.template.frames || [];

      const media = thumbnails.map((thumb, index) => {
        const base = import.meta.env.VITE_API_BASE_URL;
        const thumbnailUrl = thumb.startsWith("http") ? thumb : `${base}${thumb}`;
        const frameUrl =
          frames[index]?.startsWith("http") ? frames[index] : `${base}${frames[index]}`;

        const ext = (frameUrl || thumbnailUrl).split(".").pop()?.toLowerCase();
        const isVideo = ["mp4", "webm", "ogg", "avi", "mov"].includes(ext || "");

        return {
          id: `template-${index}`,
          thumbnailUrl,
          frameUrl,
          name: isVideo ? "Video" : "Image",
         type: (isVideo ? "video" : "image") as "video" | "image",
          isExisting: true,
        };
      });

      setMediaFiles(media);
    } else {
      setMediaFiles([]);
    }

    if (
      templateData?.template?.canvases &&
      Array.isArray(templateData.template.canvases)
    ) {
      const base = import.meta.env.VITE_API_BASE_URL;
      const loaded = templateData.template.canvases.map((c: CustomCanvas) => ({
        ...c,
        image: c.image
          ? {
              ...c.image,
              url: c.image.url.startsWith("http")
                ? c.image.url
                : `${base}${c.image.url}`,
              sourceUrl: c.image.sourceUrl
                ? c.image.sourceUrl.startsWith("http")
                  ? c.image.sourceUrl
                  : `${base}${c.image.sourceUrl}`
                : undefined,
            }
          : undefined,
      }));
      setCustomCanvases(loaded);
    } else {
      setCustomCanvases([]);
    }

    setRemovedFrameIds([]);

    if (templateData?.template?.defaultFrames?.length) {
      setCurrentDefaultFrames(templateData.template.defaultFrames);
    } else {
      setCurrentDefaultFrames(TEMPLATE_TO_FRAMES[selectedTemplate]);
    }

    const first = getFirstAvailablePredefinedId();
    setActiveSlide(first ?? 0);
  }, [templateData]);

  // ---------------------------------
  // Handle template dropdown
  // ---------------------------------
  const handleTemplateChange = (value: string | null) => {
    if (value) {
      setSelectedTemplate(value);
      setCurrentDefaultFrames(TEMPLATE_TO_FRAMES[value]);
    }
    setRemovedFrameIds([]);
    const first = TEMPLATE_TO_FRAMES[value || selectedTemplate][0];
    setActiveSlide(first ?? 0);
    if (isSlideshow) stopSlideshow(), startSlideshow();
  };

  // ---------------------------------
  // Slides list
  // ---------------------------------
  const getFilteredPredefinedSlides = () => {
    const allSlides = [
      {
        id: 1,
        component: (
          <div className="w-[900px] h-[500px] overflow-hidden">
            <IndoorAQIFrame
  aqiData={deviceMid ? latestAQIData : undefined}
  isLoading={!deviceMid || latestAQILoading}
  lastUpdated={latestAQIData?.timestamp}
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
              aqiData={aqiLogsHistory}
              realtimeAQIData={latestAQIData}
              isLoading={latestAQILoading || aqiLogsLoading}
              error={latestAQIError || aqiLogsError}
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
        realtimeAQIData={latestAQIData}     // ← ADD THIS
        isLoading={latestAQILoading || aqiLogsLoading}
        error={latestAQIError || aqiLogsError}
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
              realtimeAQIData={latestAQIData}
              isLoading={latestAQILoading || aqiLogsLoading}
              error={latestAQIError || aqiLogsError}
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

    return allSlides.filter(
      (s) =>
        currentDefaultFrames.includes(s.id) &&
        !removedFrameIds.includes(s.id)
    );
  };

  const predefinedSlides = getFilteredPredefinedSlides();

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
    isSlideshow ? stopSlideshow() : startSlideshow();
  };

  const handleSlideChange = (id: number) => {
    setActiveSlide(id);
    if (isSlideshow) stopSlideshow(), startSlideshow();
  };

  const handleDurationChange = (time: number) => {
    setSlideDuration(time);
    if (isSlideshow) {
      stopSlideshow();
      setTimeout(() => startSlideshow(), 100);
    }
  };

  const handleMediaUpload = (media: MediaFile) => {
    setMediaFiles((prev) => [...prev, media]);
  };

  const handleMediaRemove = (id: string) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
    setRemovedMediaIds((prev) => [...prev, id]);
  };

  const handleFrameRemove = (id: number) => {
    setRemovedFrameIds((r) => [...r, id]);
    setCurrentDefaultFrames((c) => c.filter((x) => x !== id));
    if (activeSlide === id) {
      const first = getFirstAvailablePredefinedId();
      setActiveSlide(first ?? 0);
    }
  };

  const handleAddCanvas = () => {
    if (customCanvases.length >= 10)
      return toast.error("Max 10 blank canvases allowed");
    const newCanvas = {
      id: `canvas-${Date.now()}`,
      name: `Canvas ${customCanvases.length + 1}`,
    };
    setCustomCanvases((prev) => [...prev, newCanvas]);
    setActiveSlide(1000 + customCanvases.length);
  };

  const handleCanvasImageChange = (
    canvasId: string,
    image: CanvasImage | undefined
  ) => {
    setCustomCanvases((prev) =>
      prev.map((c) => (c.id === canvasId ? { ...c, image } : c))
    );
  };

  const handleSidebarMediaClick = (media: MediaFile) => {
    if (!(activeSlide >= 1000)) return;
    if (media.type !== "image") return;

    const canvasIndex = activeSlide - 1000;
    const imgUrl = media.frameUrl || media.thumbnailUrl;
    if (!imgUrl) return;

    const rectWidth = 849;
    const rectHeight = 483;
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(rectWidth / img.width, rectHeight / img.height);
      const w = img.width * scale;
      const h = img.height * scale;

      const newImage: CanvasImage = {
        id: `img-${Date.now()}`,
        url: imgUrl,
        sourceUrl: imgUrl,
        x: (rectWidth - w) / 2,
        y: (rectHeight - h) / 2,
        width: w,
        height: h,
      };

      const canvasId = customCanvases[canvasIndex].id;
      handleCanvasImageChange(canvasId, newImage);
    };

    img.src = imgUrl;
  };

  const handleCanvasRemove = (id: string) => {
    setCustomCanvases((prev) => prev.filter((c) => c.id !== id));
    const index = customCanvases.findIndex((c) => c.id === id);
    if (activeSlide === 1000 + index) {
      const first = getFirstAvailablePredefinedId();
      setActiveSlide(first ?? 0);
    }
  };

  const handlePreview = () => {
    const frames = currentDefaultFrames.filter(
      (id) => !removedFrameIds.includes(id)
    );
    const canvases = customCanvases.filter((c) => c.image);

    navigate("/preview", {
      state: {
        defaultFrames: frames,
        customCanvases: canvases,
        slideDuration,
        outdoorAPIState,
      },
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      mediaFiles.forEach((m) => {
        if (!m.isExisting && m.file) {
          URL.revokeObjectURL(URL.createObjectURL(m.file));
        }
      });
    };
  }, [mediaFiles]);

  useEffect(() => {
    return () => {
      if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSlideshow) stopSlideshow();
      if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        toggleSlideshow();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [isSlideshow]);

  const renderCurrentSlide = () => {
    const validIds = currentDefaultFrames.filter(
      (id) => !removedFrameIds.includes(id)
    );

    if (
      (activeSlide === 0 || (activeSlide >= 1 && activeSlide <= 5 && !validIds.includes(activeSlide)))
    ) {
      return (
        <div className="w-[900px] h-[500px] flex items-center justify-center bg-white text-gray-500">
          Select a thumbnail to be rendered here
        </div>
      );
    }

    if (activeSlide >= 1 && activeSlide <= 5) {
      const slide = predefinedSlides.find((s) => s.id === activeSlide);
      return (
        slide?.component || (
          <IndoorAQIFrame
    aqiData={deviceMid ? latestAQIData : undefined}
    isLoading={!deviceMid || latestAQILoading}
    lastUpdated={latestAQIData?.timestamp}
  />
        )
      );
    }

    if (activeSlide >= 1000) {
      const index = activeSlide - 1000;
      const canvas = customCanvases[index];
      return <BlankCanvas image={canvas?.image} isPreview={false} />;
    }

    return (
      <IndoorAQIFrame
        aqiData={latestAQIData}
        isLoading={latestAQILoading}
        lastUpdated={latestAQIData?.timestamp}
      />
    );
  };

  const slides = [
    ...predefinedSlides,
    ...customCanvases.map((c, index) => ({
      id: 1000 + index,
      name: c.name,
      thumbnail: c.image
        ? c.image.url
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3E+%3C/text%3E%3C/svg%3E",
      isMedia: false,
      isCanvas: true,
      canvasId: c.id,
    })),
  ];

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

  if (templateError) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load template
          </h3>
          <p className="text-gray-600 mb-4">
            {templateError.message || "An error occurred while loading the template"}
          </p>
          <button
            onClick={() => mutateTemplate()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No template ID provided
          </h3>
          <p className="text-gray-600">Please provide a valid template ID in URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="px-4 py-2 bg-white border-b border-gray-200">
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
              {renderCurrentSlide()}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200">
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

      <div className="w-56 bg-white border-l border-gray-200 shadow-lg">
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
