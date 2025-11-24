import React, { useState } from "react";
import { Dropdown } from "../../../components/ui/dropdown";
import { Button } from "../../../components/ui/button";

type Props = {
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  onToggleSlideshow?: () => void;
  isSlideshow?: boolean;
  slideDuration?: number;
  onDurationChange?: (duration: number) => void;
  onSave?: () => void;
  onPreview?: () => void;
};

const templateOptions = [
  { label: "Template 1", value: "tmpl-1" },
  { label: "Template 2", value: "tmpl-2" },
  { label: "Template 3", value: "tmpl-3" },
];

const durationOptions = [
  { label: "3 seconds", value: "3" },
  { label: "5 seconds", value: "5" },
  { label: "10 seconds", value: "10" },
  { label: "15 seconds", value: "15" },
  { label: "30 seconds", value: "30" },
  { label: "1 minute", value: "60" },
];

const TemplateSetupHeader: React.FC<Props> = ({
  defaultValue = "tmpl-1",
  onChange,
  onToggleSlideshow,
  isSlideshow = false,
  slideDuration = 10,
  onDurationChange,
  onSave,
  onPreview,
}) => {
  // Ensure defaultValue matches one of the available options, fallback to "tmpl-1"
  const validatedDefaultValue = templateOptions.find(
    (option) => option.value === defaultValue
  )
    ? defaultValue
    : "tmpl-1";

  const [selected, setSelected] = useState<string | null>(
    validatedDefaultValue
  );

  const handleChange = (v: string) => {
    const val = v || null;
    setSelected(val);
    onChange?.(val);
  };

  const handleDurationChange = (duration: string) => {
    const durationValue = parseInt(duration, 10);
    onDurationChange?.(durationValue);
  };

  return (
    <div className="flex items-end justify-between py-2">
      <div className="w-48">
        <label
          htmlFor="template-select"
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Select Template
        </label>

        <Dropdown
          options={templateOptions}
          value={selected ?? ""}
          onValueChange={handleChange}
          placeholder="-- choose a template --"
          defaultValue={validatedDefaultValue ?? undefined}
          triggerClassName="h-7 text-xs"
        />
      </div>

      <div className="flex items-end gap-3">
        <div className="w-32">
          <label
            htmlFor="duration-select"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Slide Duration
          </label>
          <Dropdown
            options={durationOptions}
            value={slideDuration.toString()}
            onValueChange={handleDurationChange}
            placeholder="Select duration"
            triggerClassName="h-7 text-xs"
          />
        </div>

        <Button
          onClick={onToggleSlideshow}
          variant={isSlideshow ? "default" : "outline"}
          className="flex items-center gap-1 h-7 text-xs px-2"
        >
          {isSlideshow ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Stop Slideshow
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play Slideshow
            </>
          )}
        </Button>

        {onPreview && (
          <Button
            onClick={onPreview}
            variant="outline"
            className="flex items-center gap-1 h-7 text-xs px-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Preview
          </Button>
        )}

        {onSave && (
          <Button
            onClick={onSave}
            variant="default"
            className="flex items-center gap-1 h-7 text-xs px-3 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
            </svg>
            Save
          </Button>
        )}
      </div>
    </div>
  );
};

export default TemplateSetupHeader;
