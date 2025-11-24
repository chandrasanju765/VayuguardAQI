import type { APIResponse, RoleCode, User } from "./common";

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse
  extends APIResponse<{
    role: RoleCode;
    user?: User;
  }> {}
