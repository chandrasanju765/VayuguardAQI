import type { AQIDevice } from "./AQIDevices";
import type { APIResponse, User } from "./common";

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

export interface Template {
  _id: string;
  dashboardId: string;
  title: string;
  description?: string;
  deviceId: AQIDevice | string;
  colorStandard?: string;
  company?: string;
  createdBy?: User | null;
  sharedWith: any[];
  createdAt: string;
  updatedAt: string;
  template?: {
    thumbnails: string[];
    frames: string[];
    defaultFrames: number[];
    canvases?: CustomCanvas[];
  };
  __v?: number;
}

export interface CreateOrUpdateTemplateRequest {
  title: string;
  description?: string;
  deviceId: string;
  company: string;
  dashboardId: string;
  createdBy?: string;
}

export interface TemplateColumns {
  dashboardId: string;
  title: string;
  description: string;
  deviceId: string;
  company: string;
  createdBy: string;
  template: string;
  share: string;
}

export interface GetTemplatesResponse
  extends APIResponse<{
    data: Template[];
    columns: TemplateColumns;
  }> {}

export interface CreateOrUpdateTemplateResponse extends APIResponse<Template> {}

export interface SaveTemplateRequest {
  colorStandard: string;
  template: {
    thumbnails: string[];
    frames: string[];
    defaultFrames: number[];
    canvases?: CustomCanvas[];
  };
}
