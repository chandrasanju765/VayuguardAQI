import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import IndoorAQIFrame from "../setup/frames/Frame1";
import OutdoorAQIFrame from "../setup/frames/Frame2";
import ComparisonScaleFrame from "../setup/frames/Frame3";
import { ComparisonFrame } from "../setup/frames/Frame4";
import Frame5 from "../setup/frames/Frame5";
import BlankCanvas from "../setup/frames/BlankCanvas";
import { useAQIDataForSelectedDevice } from "../../../hooks/useAQIDataForSelectedDevice";
import { useGetOutdoorAQIData } from "../../../data/cachedQueries";
import { XIcon } from "lucide-react";

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

interface PreviewState {
  defaultFrames: number[];
  customCanvases: CustomCanvas[];
  slideDuration: number;
  outdoorAPIState?: string | null;
}

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState;

  const [activeSlide, setActiveSlide] = useState<number>(1);
  const slideshowIntervalRef = useRef<number | null>(null);

  const {
    data: aqiLogsHistory,
    error: aqiLogsError,
    isLoading: aqiLogsLoading,
  } = useAQIDataForSelectedDevice({
    daysBack: 1,
  });

  const {
    data: outdoorAQIData,
    isLoading: outdoorLoading,
    error: outdoorError,
  } = useGetOutdoorAQIData(state?.outdoorAPIState ?? null);

  const defaultFrames = state?.defaultFrames || [1, 2, 3, 4, 5];
  const customCanvases = state?.customCanvases || [];
  const slideDuration = state?.slideDuration || 10;

  const getAvailableSlideIds = (): number[] => {
    const canvasIds = customCanvases
      .map((canvas, index) => ({
        id: 1000 + index,
        hasImage: !!canvas.image,
      }))
      .filter((c) => c.hasImage)
      .map((c) => c.id);

    return [...defaultFrames, ...canvasIds];
  };

  const getNextSlideId = (current: number): number => {
    const ids = getAvailableSlideIds();
    if (ids.length === 0) return 1;
    const idx = ids.indexOf(current);
    if (idx === -1) return ids[0];
    return ids[(idx + 1) % ids.length];
  };

  const handleExit = () => {
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
    }
    navigate(-1);
  };

  useEffect(() => {
    const ids = getAvailableSlideIds();
    setActiveSlide(ids[0] || 1);

    slideshowIntervalRef.current = window.setInterval(() => {
      setActiveSlide((prev) => getNextSlideId(prev));
    }, slideDuration * 1000);

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, [slideDuration]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleExit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const renderSlide = () => {
    if (activeSlide >= 1 && activeSlide <= 5) {
      const frameComponents = {
        1: (
          <IndoorAQIFrame aqiData={aqiLogsHistory} isLoading={aqiLogsLoading} />
        ),
        2: (
          <OutdoorAQIFrame
            outdoorAQIData={outdoorAQIData}
            outdoorLoading={outdoorLoading}
            outdoorError={outdoorError}
          />
        ),
        3: (
          <ComparisonScaleFrame
            aqiData={aqiLogsHistory}
            isLoading={aqiLogsLoading}
            error={aqiLogsError}
            outdoorAQIData={outdoorAQIData}
            outdoorLoading={outdoorLoading}
            outdoorError={outdoorError}
          />
        ),
        4: (
          <ComparisonFrame
            aqiData={aqiLogsHistory}
            isLoading={aqiLogsLoading}
            error={aqiLogsError}
            outdoorAQIData={outdoorAQIData}
            outdoorLoading={outdoorLoading}
            outdoorError={outdoorError}
          />
        ),
        5: (
          <Frame5
            aqiData={aqiLogsHistory}
            isLoading={aqiLogsLoading}
            error={aqiLogsError}
            outdoorAQIData={outdoorAQIData}
            outdoorLoading={outdoorLoading}
            outdoorError={outdoorError}
          />
        ),
      };

      const component =
        frameComponents[activeSlide as keyof typeof frameComponents];

      const frameWidth = 849;
      const frameHeight = 483;
      const scaleX = window.innerWidth / frameWidth;
      const scaleY = window.innerHeight / frameHeight;
      const scale = Math.min(scaleX, scaleY) * 1;

      return (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-[900px] h-[500px]"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            {component}
          </div>
        </div>
      );
    }

    if (activeSlide >= 1000) {
      const canvasIndex = activeSlide - 1000;
      if (canvasIndex >= 0 && canvasIndex < customCanvases.length) {
        const canvas = customCanvases[canvasIndex];

        const frameWidth = 849;
        const frameHeight = 483;
        const scaleX = window.innerWidth / frameWidth;
        const scaleY = window.innerHeight / frameHeight;
        const scale = Math.min(scaleX, scaleY) * 1.1;

        return (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-[900px] h-[500px]"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              <BlankCanvas image={canvas.image} isPreview={true} />
            </div>
          </div>
        );
      }
    }

    return (
      <IndoorAQIFrame aqiData={aqiLogsHistory} isLoading={aqiLogsLoading} />
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="w-full h-full">{renderSlide()}</div>

      <button
        onClick={handleExit}
        className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-black rounded-full p-3 transition-all duration-200"
        title="Exit Preview (ESC)"
      >
        <XIcon className="h-4 w-4 text-black" />
      </button>
    </div>
  );
};

export default PreviewPage;
