import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: string[] | DropdownOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  defaultValue?: string;
}

const Dropdown = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  DropdownProps
>(
  (
    {
      options,
      placeholder = "Select an option",
      value,
      onValueChange,
      disabled = false,
      className,
      triggerClassName,
      contentClassName,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue || ""
    );

    // Determine if we're in controlled or uncontrolled mode
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    // Normalize options to DropdownOption format
    const normalizedOptions: DropdownOption[] = options.map((option) => {
      if (typeof option === "string") {
        return { label: option, value: option };
      }
      return option;
    });

    return (
      <div className={cn("w-full", className)}>
        <Select
          value={currentValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          defaultValue={defaultValue}
        >
          <SelectTrigger
            ref={ref}
            className={cn("w-full", triggerClassName)}
            {...props}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={cn("bg-white", contentClassName)}>
            {normalizedOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

export { Dropdown };
