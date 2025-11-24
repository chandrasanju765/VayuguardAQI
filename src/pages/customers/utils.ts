import type { FormField } from "../../components/ui/modal";
import type {
  CreateOrUpdateCustomerRequest,
  CustomerColumns,
} from "../../models/Customers";
import { z } from "zod";
import { getCurrentUser } from "../../utils";

export const CustomerTableColumnLabels: Record<keyof CustomerColumns, string> =
  (() => {
    const role = getCurrentUser()?.role;
    const label = role === "customer" ? "User" : "Customer";
    return {
      customerId: `${label} ID`,
      name: "Name",
      email: "Email",
      phone: "Phone",
      user_role: "User Role",
      company: "Company",
    };
  })();

export interface TypeSafeFormField extends Omit<FormField, "name"> {
  name: keyof CreateOrUpdateCustomerRequest;
}

export const USER_ROLE_OPTIONS = [
  { label: "Executive", value: "executive" },
  { label: "Admin", value: "useradmin" },
];

export const createCustomerFormFields = (): TypeSafeFormField[] => {
  const role = getCurrentUser()?.role;
  const label = role === "customer" ? "User" : "Customer";
  const fields: TypeSafeFormField[] = [
    {
      name: "customerId",
      label: `${label} ID`,
      type: "text",
      required: true,
      placeholder: `Enter ${label} ID`,
      validation: z.string().min(1, `${label} ID is required`),
    },
    {
      name: "name",
      label: `${label} Name`,
      type: "text",
      required: true,
      placeholder: `Enter ${label} Name`,
      validation: z.string().min(1, `${label} Name is required`),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter Email Address",
      validation: z.string().email("Please enter a valid email address"),
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "Enter Phone Number",
      validation: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    },
    {
      name: "user_role",
      label: "User Role",
      type: "select",
      required: true,
      options: USER_ROLE_OPTIONS,
      validation: z.string().min(1, "User Role is required"),
    },
    {
      name: "company",
      label: "Company",
      type: "text",
      required: true,
      placeholder: "Enter Company Name",
      validation: z.string().min(1, "Company is required"),
    },
  ];

  return fields;
};

export const deviceFormFields: TypeSafeFormField[] = createCustomerFormFields();
