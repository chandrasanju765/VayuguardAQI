import type { APIResponse, AQILog, AQILogsColumns } from "./common";

export interface GetAQILogsByRoleResponse
  extends APIResponse<{
    data: AQILog[];
    columns: AQILogsColumns;
  }> {}
