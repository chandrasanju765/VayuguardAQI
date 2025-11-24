import * as React from "react";
import { XIcon } from "lucide-react";
import {
  useForm,
  Controller,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { z } from "zod";

// Form Field Interface for enhanced FormModal
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: object;
  description?: string; // Additional description for checkboxes
  disabled?: boolean;
  readOnly?: boolean;
  value?: string; // Default value for disabled fields
  onChange?: (value: string) => void; // Add onChange callback
}

// Modal Context
interface ModalContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ModalContext = React.createContext<ModalContextType | null>(null);

// Hook to use modal context
const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal provider");
  }
  return context;
};

// Modal Root Component
export interface ModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Use controlled or uncontrolled state
  const isControlled = open !== undefined;
  const modalOpen = isControlled ? open : isOpen;
  const setModalOpen = isControlled ? onOpenChange || (() => {}) : setIsOpen;

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [modalOpen, setModalOpen]);

  return (
    <ModalContext.Provider
      value={{ isOpen: modalOpen, setIsOpen: setModalOpen }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Modal Trigger Component
export interface ModalTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const ModalTrigger: React.FC<ModalTriggerProps> = ({
  children,
  asChild = false,
  className,
}) => {
  const { setIsOpen } = useModal();

  const handleClick = () => {
    setIsOpen(true);
  };

  if (asChild) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: handleClick,
      className: cn(className, child.props.className),
    });
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  );
};

// Modal Content Component
export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  overlayClassName?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className,
  size = "md",
  position = "center",
  showCloseButton = true,
  closeOnOverlayClick = true,
  overlayClassName,
}) => {
  const { isOpen, setIsOpen } = useModal();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      case "full":
        return "max-w-[95vw] max-h-[95vh]";
      default:
        return "max-w-lg";
    }
  };

  // Position variants
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "items-start pt-16";
      case "center":
      default:
        return "items-center";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        // Overlay styles - matches your app's backdrop patterns
        "fixed inset-0 z-50 flex justify-center bg-black/50 backdrop-blur-sm",
        getPositionClasses(),
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className={cn(
          // Base modal styles - consistent with your card components
          "relative w-full bg-white rounded-lg shadow-lg border border-gray-200",
          "mx-4 my-8 overflow-hidden",
          // Animation
          "animate-in fade-in-0 zoom-in-95 duration-200",
          // Size classes
          getSizeClasses(),
          // Custom className
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close modal</span>
          </Button>
        )}

        {children}
      </div>
    </div>
  );
};

// Modal Header Component
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6 pb-4 border-b border-gray-100",
        className
      )}
    >
      {children}
    </div>
  );
};

// Modal Title Component
export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-gray-900 leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  );
};

// Modal Description Component
export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription: React.FC<ModalDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)}>{children}</p>
  );
};

// Modal Body Component
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  maxHeight?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  scrollable = false,
  maxHeight = "60vh",
}) => {
  return (
    <div
      className={cn("p-6", scrollable && `overflow-y-auto`, className)}
      style={scrollable ? { maxHeight } : undefined}
    >
      {children}
    </div>
  );
};

// Modal Footer Component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "separated";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  variant = "default",
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-6 pt-4",
        variant === "separated" && "border-t border-gray-100 bg-gray-50/50",
        className
      )}
    >
      {children}
    </div>
  );
};

// Confirmation Modal Component (Pre-built for common use cases)
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="sm" closeOnOverlayClick={!loading}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>

        <ModalFooter variant="separated" className="justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={loading ? "opacity-50 cursor-not-allowed" : ""}
          >
            {loading ? "Loading..." : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Enhanced Form Modal Component with dynamic form generation
export interface FormModalProps<T extends FieldValues = FieldValues> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  // Form-specific props
  isForm?: boolean;
  fields?: FormField[];
  onSubmit?: (data?: T) => void | Promise<void>; // Unified submit handler
  initialValues?: Partial<T>;
  submitText?: string;
  cancelText?: string;
  showResetButton?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  scrollable?: boolean;
  maxHeight?: string;
}

export const FormModal = <T extends FieldValues = Record<string, any>>({
  isOpen,
  onClose,
  title,
  description,
  children,
  isForm = false,
  fields = [],
  onSubmit,
  initialValues: defaultValues,
  submitText = "Save",
  cancelText = "Cancel",
  showResetButton = false,
  loading = false,
  size = "md",
  scrollable = false,
  maxHeight = "60vh",
}: FormModalProps<T>) => {
  const schema = z.object(
    fields.reduce((acc, field) => {
      if (field.validation) {
        acc[field.name] = field.validation;
      }
      return acc;
    }, {} as Record<string, any>)
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
    resolver:
      Object.keys(schema.shape).length > 0
        ? (zodResolver(schema) as Resolver<T>)
        : undefined,
  });

  const handleFormSubmit: SubmitHandler<T> = async (formValues: T) => {
    if (onSubmit) {
      try {
        await onSubmit(formValues);
        onClose();
      } catch (error) {
        console.error("Form submission error:", error);
      }
    } else {
      console.warn("No onSubmit handler provided");
    }
  };

  const handleRegularSubmit = async () => {
    if (onSubmit) {
      try {
        await onSubmit();
        onClose();
      } catch (error) {
        console.error("Submit error:", error);
      }
    }
  };

  const handleReset = () => {
    reset(defaultValues as DefaultValues<T>);
  };

  const renderField = (field: FormField) => {
    const {
      name,
      label,
      type,
      placeholder,
      required,
      options,
      description,
      disabled,
      readOnly,
      value,
      onChange: fieldOnChange,
    } = field;

    // Checkbox has a different layout structure
    if (type === "checkbox") {
      return (
        <div key={name} className="space-y-2">
          <div className="flex items-start space-x-3">
            <Controller
              name={name as any}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field: controllerField }) => (
                <input
                  type="checkbox"
                  {...controllerField}
                  id={name}
                  checked={controllerField.value || false}
                  onChange={(e) => controllerField.onChange(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
              )}
            />
            <div className="flex-1">
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 cursor-pointer"
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          {errors[name as keyof T] && (
            <p className="text-sm text-red-600 mt-1 ml-7">
              {errors[name as keyof T]?.message as string}
            </p>
          )}
        </div>
      );
    }

    return (
      <div key={name} className="space-y-2">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === "select" ? (
          <Controller
            name={name as any}
            control={control}
            rules={{ required: required ? `${label} is required` : false }}
            render={({ field: controllerField }) => (
              <select
                {...controllerField}
                id={name}
                disabled={disabled}
                onChange={(e) => {
                  controllerField.onChange(e.target.value);
                  // Call custom onChange if provided
                  if (fieldOnChange && e.target.value) {
                    fieldOnChange(e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              >
                <option value="">{placeholder || `Select ${label}`}</option>
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        ) : type === "textarea" ? (
          readOnly ? (
            <Controller
              name={name as any}
              control={control}
              rules={{ required: required ? `${label} is required` : false }}
              defaultValue={value as any}
              render={({ field: controllerField }) => (
                <textarea
                  {...controllerField}
                  id={name}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical min-h-[80px] bg-gray-50 text-gray-600 cursor-default`}
                />
              )}
            />
          ) : (
            <textarea
              {...register(name as any, {
                required: required ? `${label} is required` : false,
              })}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              defaultValue={disabled ? value : undefined}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical min-h-[80px] ${
                disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          )
        ) : readOnly ? (
          <Controller
            name={name as any}
            control={control}
            rules={{ required: required ? `${label} is required` : false }}
            render={({ field: { onChange, value: fieldValue, ...field } }) => (
              <input
                {...field}
                type={type}
                id={name}
                placeholder={placeholder}
                readOnly={readOnly}
                value={fieldValue || value || ""}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50 text-gray-600 cursor-default`}
              />
            )}
          />
        ) : (
          <input
            type={type}
            {...register(name as any, {
              required: required ? `${label} is required` : false,
            })}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            defaultValue={disabled ? value : undefined}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
          />
        )}

        {errors[name as keyof T] && (
          <p className="text-sm text-red-600 mt-1">
            {errors[name as keyof T]?.message as string}
          </p>
        )}
      </div>
    );
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size={size} closeOnOverlayClick={!loading}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>

        {isForm && fields.length > 0 ? (
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col h-full"
          >
            <ModalBody scrollable={scrollable} maxHeight={maxHeight}>
              <div className="space-y-6">
                {fields.map((field) => renderField(field))}
                {children}
              </div>
            </ModalBody>

            {onSubmit && (
              <ModalFooter variant="separated" className="justify-end gap-3">
                {showResetButton && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={loading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {loading ? "Saving..." : submitText}
                </Button>
              </ModalFooter>
            )}
          </form>
        ) : (
          <>
            <ModalBody scrollable={scrollable} maxHeight={maxHeight}>
              {children}
            </ModalBody>
            {onSubmit && (
              <ModalFooter variant="separated" className="justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  onClick={handleRegularSubmit}
                  disabled={loading}
                  className={loading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {loading ? "Saving..." : submitText}
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// Export all components
export default Modal;
