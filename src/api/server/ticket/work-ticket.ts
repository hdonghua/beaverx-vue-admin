import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { QueryPageRequest, PagedResultDto } from '@/types/page';

export enum WorkTicketStatus {
  Pending = 0,
  Processing = 1,
  Resolved = 2,
  Closed = 3,
}

export interface WorkTicketImageDto {
  objectKey: string;
  proxyUrl: string;
  fileName: string;
}

export interface WorkTicketDto {
  id: EntityId;
  ticketNo: string;
  title: string;
  content: string;
  status: WorkTicketStatus;
  userId: EntityId;
  creatorName?: string | null;
  images: WorkTicketImageDto[];
  processResult?: string | null;
  processResultImages: WorkTicketImageDto[];
  handlerUserId?: EntityId | null;
  handlerName?: string | null;
  processedTime?: string | null;
  creationTime: string;
  lastModificationTime?: string | null;
}

export interface QueryWorkTicketPageRequest extends QueryPageRequest {
  keyword?: string | null;
  status?: WorkTicketStatus | null;
}

export interface CreateWorkTicketRequest {
  title: string;
  content: string;
  images?: WorkTicketImageDto[];
}

export interface UpdateWorkTicketRequest {
  id: EntityId;
  title?: string;
  content?: string;
  images?: WorkTicketImageDto[];
}

export interface ProcessWorkTicketRequest {
  id: EntityId;
  status: WorkTicketStatus;
  processResult: string;
  processResultImages?: WorkTicketImageDto[];
}

export const MAX_WORK_TICKET_IMAGES = 3;

export function queryWorkTicketPage(req: QueryWorkTicketPageRequest) {
  return axios.get<
    QueryWorkTicketPageRequest,
    ApiResponse<PagedResultDto<WorkTicketDto>>
  >('/api/WorkTicket/list', {
    params: {
      keyword: req.keyword || undefined,
      status: req.status ?? undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

export function queryWorkTicketProcessPage(req: QueryWorkTicketPageRequest) {
  return axios.get<
    QueryWorkTicketPageRequest,
    ApiResponse<PagedResultDto<WorkTicketDto>>
  >('/api/WorkTicket/process-list', {
    params: {
      keyword: req.keyword || undefined,
      status: req.status ?? undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

export function getWorkTicketById(id: EntityId) {
  return axios.get<void, ApiResponse<WorkTicketDto>>(`/api/WorkTicket/${id}`);
}

export function addWorkTicket(req: CreateWorkTicketRequest) {
  return axios.post<CreateWorkTicketRequest, ApiResponse<WorkTicketDto>>(
    '/api/WorkTicket',
    req
  );
}

export function updateWorkTicket(req: UpdateWorkTicketRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateWorkTicketRequest, 'id'>, ApiResponse<WorkTicketDto>>(
    `/api/WorkTicket/${id}`,
    body
  );
}

export function processWorkTicket(req: ProcessWorkTicketRequest) {
  const { id, ...body } = req;
  return axios.post<Omit<ProcessWorkTicketRequest, 'id'>, ApiResponse<WorkTicketDto>>(
    `/api/WorkTicket/${id}/process`,
    body
  );
}

export function deleteWorkTicket(id: EntityId) {
  return axios.delete<EntityId, ApiResponse<void>>(`/api/WorkTicket/${id}`);
}
