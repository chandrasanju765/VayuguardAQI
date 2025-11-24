import React from "react";
import { Play, X, Plus } from "lucide-react";

interface Slide {
  id: number;
  name: string;
  thumbnail: string;
  isMedia?: boolean;
  mediaType?: "image" | "video";
  mediaId?: string;
  isCanvas?: boolean;
  canvasId?: string;
}

interface TemplateSetupFooterProps {
  slides: Slide[];
  activeSlide: number;
  onSlideSelect: (slideId: number) => void;
  onMediaRemove?: (mediaId: string) => void;
  onFrameRemove?: (frameId: number) => void;
  onAddCanvas?: () => void;
  onCanvasRemove?: (canvasId: string) => void;
}

const TemplateSetupFooter: React.FC<TemplateSetupFooterProps> = ({
  slides,
  activeSlide,
  onSlideSelect,
  onMediaRemove,
  onFrameRemove,
  onAddCanvas,
  onCanvasRemove,
}) => {
  const handleDeleteMedia = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    onMediaRemove?.(mediaId);
  };

  const handleDeleteFrame = (e: React.MouseEvent, frameId: number) => {
    e.stopPropagation();
    onFrameRemove?.(frameId);
  };

  const handleDeleteCanvas = (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation();
    onCanvasRemove?.(canvasId);
  };

  return (
    <div className="p-2 bg-white border-t border-gray-200 w-full min-w-0">
      <div className="overflow-x-auto footer-scroll-container scroll-smooth">
        <div className="flex items-center gap-3 lg:gap-4 px-2 py-1 w-max">
          {slides.map((slide) => (
            <div
              key={`${slide.isMedia ? "m" : "p"}-${
                slide.isMedia ? slide.mediaId ?? slide.id : slide.id
              }`}
              className={`
                relative cursor-pointer transition-all duration-200 group flex-shrink-0
              `}
              onClick={() => onSlideSelect(slide.id)}
            >
              <div
                className={`w-24 h-16 lg:w-28 lg:h-18 bg-white rounded-lg overflow-hidden shadow-lg border-2 border-gray-300 group-hover:shadow-xl group-hover:border-gray-400 transition-all duration-200 relative
                  ${
                    activeSlide === slide.id
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  }
                  `}
              >
                <img
                  src={slide.thumbnail}
                  alt={`Thumbnail ${slide.name}`}
                  className="w-full h-full object-cover"
                />
                {slide.isMedia && slide.mediaType === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play
                      className="w-3 h-3 lg:w-4 lg:h-4 text-white opacity-80"
                      fill="currentColor"
                    />
                  </div>
                )}

                {(slide.isMedia && slide.mediaId && onMediaRemove) ||
                (slide.isCanvas && slide.canvasId && onCanvasRemove) ||
                (!slide.isMedia && !slide.isCanvas && onFrameRemove) ? (
                  <button
                    onClick={(e) => {
                      if (slide.isMedia && slide.mediaId) {
                        handleDeleteMedia(e, slide.mediaId);
                      } else if (slide.isCanvas && slide.canvasId) {
                        handleDeleteCanvas(e, slide.canvasId);
                      } else {
                        handleDeleteFrame(e, slide.id);
                      }
                    }}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-200 z-10"
                    title={
                      slide.isMedia
                        ? "Delete media"
                        : slide.isCanvas
                        ? "Delete canvas"
                        : "Delete frame"
                    }
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          {onAddCanvas && (
            <div className="relative cursor-pointer transition-all duration-200 group flex-shrink-0">
              <div
                className="w-24 h-16 lg:w-28 lg:h-18 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden shadow-lg border-2 border-dashed border-blue-300 hover:border-blue-400 group-hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                onClick={onAddCanvas}
              >
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSetupFooter;
