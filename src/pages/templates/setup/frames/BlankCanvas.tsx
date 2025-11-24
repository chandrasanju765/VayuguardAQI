import { Plus } from "lucide-react";
import { useRef } from "react";

interface CanvasImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlankCanvasProps {
  image?: CanvasImage;
  isPreview?: boolean;
}

const BlankCanvas = ({ image, isPreview }: BlankCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="w-[900px] h-[500px] bg-white border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
    >
      {!image && !isPreview && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <Plus className="w-16 h-16 mb-2" />
          <p className="text-lg font-medium">Select an image from sidebar</p>
        </div>
      )}

      {image && (
        <div
          key={image.id}
          className="absolute group"
          style={{
            left: `${image.x}px`,
            top: `${image.y}px`,
            width: `${image.width}px`,
            height: `${image.height}px`,
            cursor: isPreview ? "default" : "move",
          }}
        >
          <img
            src={image.url}
            alt="Canvas element"
            className="w-full h-full object-contain rounded shadow-lg"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default BlankCanvas;
