import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export enum ExportTaskStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
}

export const ExportTypes = {
  SystemUser: 'system.user',
  SystemConfig: 'system.config',
  SystemDictData: 'system.dict_data',
} as const;

export interface ExportTaskDto {
  id: EntityId;
  exportType: string;
  parameters?: string | null;
  fileName: string;
  fileUrl?: string | null;
  status: ExportTaskStatus;
  errorMessage?: string | null;
  creationTime: string;
  completedTime?: string | null;
}

export interface CreateExportTaskRequest {
  exportType: string;
  parameters?: Record<string, unknown>;
}

export interface ExportDownloadUrlDto {
  url: string;
  fileName: string;
}

export function createExportTask(req: CreateExportTaskRequest) {
  return axios.post<CreateExportTaskRequest, ApiResponse<ExportTaskDto>>(
    '/api/ExportTask',
    req
  );
}

export function getExportTaskList() {
  return axios.get<void, ApiResponse<ExportTaskDto[]>>('/api/ExportTask/list');
}

export function getExportActiveCount() {
  return axios.get<void, ApiResponse<number>>('/api/ExportTask/active-count');
}

export function getExportDownloadUrl(id: EntityId) {
  return axios.get<void, ApiResponse<ExportDownloadUrlDto>>(
    `/api/ExportTask/${id}/download-url`
  );
}
