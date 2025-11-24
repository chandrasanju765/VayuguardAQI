import type { APIResponse, User, UserRoleCode } from "./common";

export type { User };

export type CustomerRole = UserRoleCode;

export interface CustomerColumns {
  company: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  user_role: string;
}

// --- API Requests & Responses ⬇️---

export interface CreateOrUpdateCustomerRequest {
  customerId: string;
  company: string;
  email: string;
  name: string;
  phone: string;
  user_role: UserRoleCode;
}

export interface CreateOrUpdateCustomerResponse extends APIResponse<User> {}

export interface GetCustomersApiResponse
  extends APIResponse<{
    data: User[];
    columns: CustomerColumns;
  }> {}
