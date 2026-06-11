import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';
import { QueryPageRequest, PagedResultDto } from '@/types/page';

export enum ScheduledJobType {
  HttpApi = 1,
}

export enum ScheduledJobHttpMethod {
  Get = 1,
  Post = 2,
  Put = 3,
  Delete = 4,
}

export enum ScheduledJobRunStatus {
  Success = 1,
  Failed = 2,
}

export interface ScheduledJobDto {
  id: number;
  jobCode: string;
  name: string;
  jobType: ScheduledJobType;
  cronExpression: string;
  timeZoneId: string;
  isEnabled: boolean;
  description?: string | null;
  httpMethod: ScheduledJobHttpMethod;
  httpUrl: string;
  httpHeadersJson?: string | null;
  httpBody?: string | null;
  timeoutSeconds: number;
  lastRunTime?: string | null;
  lastRunStatus?: ScheduledJobRunStatus | null;
  lastRunMessage?: string | null;
  creationTime: string;
}

export interface ScheduledJobLogDto {
  id: number;
  jobId: number;
  status: ScheduledJobRunStatus;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
  httpStatusCode?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  isManualTrigger: boolean;
}

export interface QueryScheduledJobPageRequest extends QueryPageRequest {
  keyword?: string | null;
  isEnabled?: boolean | null;
}

export interface CreateScheduledJobRequest {
  jobCode: string;
  name: string;
  jobType?: ScheduledJobType;
  cronExpression: string;
  timeZoneId?: string;
  isEnabled?: boolean;
  description?: string;
  httpMethod?: ScheduledJobHttpMethod;
  httpUrl: string;
  httpHeadersJson?: string;
  httpBody?: string;
  timeoutSeconds?: number;
}

export interface UpdateScheduledJobRequest {
  id: number;
  name?: string;
  cronExpression?: string;
  timeZoneId?: string;
  isEnabled?: boolean;
  description?: string;
  httpMethod?: ScheduledJobHttpMethod;
  httpUrl?: string;
  httpHeadersJson?: string;
  httpBody?: string;
  timeoutSeconds?: number;
}

export interface ValidateCronResult {
  isValid: boolean;
  errorMessage?: string | null;
  nextOccurrences?: string[] | null;
}

export function queryScheduledJobPage(req: QueryScheduledJobPageRequest) {
  return axios.get<
    QueryScheduledJobPageRequest,
    ApiResponse<PagedResultDto<ScheduledJobDto>>
  >('/api/ScheduledJob/list', {
    params: {
      keyword: req.keyword || undefined,
      isEnabled: req.isEnabled ?? undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

export function getScheduledJobById(id: number) {
  return axios.get<void, ApiResponse<ScheduledJobDto>>(`/api/ScheduledJob/${id}`);
}

export function addScheduledJob(req: CreateScheduledJobRequest) {
  return axios.post<CreateScheduledJobRequest, ApiResponse<ScheduledJobDto>>(
    '/api/ScheduledJob',
    req
  );
}

export function updateScheduledJob(req: UpdateScheduledJobRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateScheduledJobRequest, 'id'>, ApiResponse<ScheduledJobDto>>(
    `/api/ScheduledJob/${id}`,
    body
  );
}

export function deleteScheduledJob(id: number) {
  return axios.delete<number, ApiResponse<void>>(`/api/ScheduledJob/${id}`);
}

export function triggerScheduledJob(id: number) {
  return axios.post<void, ApiResponse<void>>(`/api/ScheduledJob/${id}/trigger`);
}

export function queryScheduledJobLogs(id: number, current = 1, pageSize = 10) {
  return axios.get<void, ApiResponse<PagedResultDto<ScheduledJobLogDto>>>(
    `/api/ScheduledJob/${id}/logs`,
    {
      params: { page: current, pageSize },
    }
  );
}

export function validateCronExpression(cronExpression: string) {
  return axios.post<{ cronExpression: string }, ApiResponse<ValidateCronResult>>(
    '/api/ScheduledJob/validate-cron',
    { cronExpression }
  );
}
