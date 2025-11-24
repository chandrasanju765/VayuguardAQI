import customAxios from "./config";
import type { LoginUserRequest, LoginUserResponse } from "../models/Login";
import type {
  CreateOrUpdateAQIDeviceRequest,
  CreateOrUpdateAQIDeviceResponse,
} from "../models/AQIDevices";
import { mutate } from "swr";
import type { APIResponse, User } from "../models/common";
import type { CreateOrUpdateCustomerRequest } from "../models/Customers";
import type {
  CreateOrUpdateAPISubscriptionRequest,
  CreateOrUpdateAPISubscriptionResponse,
} from "../models/APISubscriptions";
import type {
  CreateOrUpdateTemplateRequest,
  CreateOrUpdateTemplateResponse,
  SaveTemplateRequest,
} from "../models/Templates";

export const loginUser = async (
  body: LoginUserRequest
): Promise<LoginUserResponse> => {
  try {
    const response = await customAxios.post("/login", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAQIDevice = async (
  body: CreateOrUpdateAQIDeviceRequest
): Promise<CreateOrUpdateAQIDeviceResponse> => {
  try {
    const response = await customAxios.post("/api/AirQualityDevice", body);
    mutate("/api/AirQualityDevice");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAQIDevice = async ({
  _id,
  body,
}: {
  _id: string;
  body: CreateOrUpdateAQIDeviceRequest;
}): Promise<CreateOrUpdateAQIDeviceResponse> => {
  try {
    const response = await customAxios.put(
      `/api/AirQualityDevice/${_id}`,
      body
    );
    mutate("/api/AirQualityDevice");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAQIDevice = async (
  _id: string
): Promise<APIResponse<null>> => {
  try {
    const response = await customAxios.delete(`/api/AirQualityDevice/${_id}`);
    mutate("/api/AirQualityDevice");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (
  body: CreateOrUpdateCustomerRequest
): Promise<APIResponse<User>> => {
  try {
    const response = await customAxios.post("/api/Customer", body);
    mutate("/api/Customer");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async ({
  _id,
  body,
}: {
  _id: string;
  body: CreateOrUpdateCustomerRequest;
}): Promise<APIResponse<User>> => {
  try {
    const response = await customAxios.put(`/api/Customer/${_id}`, body);
    mutate("/api/Customer");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (
  _id: string
): Promise<APIResponse<null>> => {
  try {
    const response = await customAxios.delete(`/api/Customer/${_id}`);
    mutate("/api/Customer");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAPISubscription = async (
  body: CreateOrUpdateAPISubscriptionRequest
): Promise<CreateOrUpdateAPISubscriptionResponse> => {
  try {
    const response = await customAxios.post("/api/Subscription", body);
    mutate("/api/Subscription");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAPISubscription = async ({
  _id,
  body,
}: {
  _id: string;
  body: CreateOrUpdateAPISubscriptionRequest;
}): Promise<CreateOrUpdateAPISubscriptionResponse> => {
  try {
    const response = await customAxios.put(`/api/Subscription/${_id}`, body);
    mutate("/api/Subscription");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAPISubscription = async (
  _id: string
): Promise<APIResponse<null>> => {
  try {
    const response = await customAxios.delete(`/api/Subscription/${_id}`);
    mutate("/api/Subscription");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTemplate = async (
  body: CreateOrUpdateTemplateRequest
): Promise<CreateOrUpdateTemplateResponse> => {
  try {
    const response = await customAxios.post("/api/Dashboard", body);
    mutate("/api/Dashboard");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTemplate = async ({
  _id,
  body,
}: {
  _id: string;
  body: CreateOrUpdateTemplateRequest;
}): Promise<CreateOrUpdateTemplateResponse> => {
  try {
    const response = await customAxios.put(`/api/Dashboard/${_id}`, body);
    mutate("/api/Dashboard");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTemplate = async (
  _id: string
): Promise<APIResponse<null>> => {
  try {
    const response = await customAxios.delete(`/api/Dashboard/${_id}`);
    mutate("/api/Dashboard");
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface UploadedFileResponse {
  frameUrl: string;
  thumbnailUrl: string;
}

interface UploadResponse {
  message: string;
  files: UploadedFileResponse[];
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("files", file);

    const response = await customAxios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    mutate("/api/files");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveTemplate = async ({
  _id,
  body,
}: {
  _id: string;
  body: SaveTemplateRequest;
}): Promise<CreateOrUpdateTemplateResponse> => {
  try {
    const response = await customAxios.put(`/api/Dashboard/${_id}`, body);
    mutate("/api/Dashboard");
    return response.data;
  } catch (error) {
    throw error;
  }
};
