import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { QueryPageRequest, PagedResultDto } from '@/types/page';

export interface QueryConfigPageRequest extends QueryPageRequest {
  keyword?: string | null;
  group?: string | null;
  isEnabled?: boolean | null;
}

export interface ConfigDto {
  id: EntityId;
  key: string;
  value: string;
  label: string;
  group?: string | null;
  remark?: string | null;
  sort: number;
  isEnabled: boolean;
  creationTime: string;
}

export interface CreateConfigRequest {
  key: string;
  value: string;
  label: string;
  group?: string;
  remark?: string;
  sort?: number;
  isEnabled?: boolean;
}

export interface UpdateConfigRequest {
  id: EntityId;
  value?: string;
  label?: string;
  group?: string;
  remark?: string;
  sort?: number;
  isEnabled?: boolean;
}

export function queryConfigPage(req: QueryConfigPageRequest) {
  return axios.get<
    QueryConfigPageRequest,
    ApiResponse<PagedResultDto<ConfigDto>>
  >('/api/Config/list', {
    params: {
      keyword: req.keyword || undefined,
      group: req.group ?? undefined,
      isEnabled: req.isEnabled ?? undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

export function queryConfigGroups() {
  return axios.get<void, ApiResponse<string[]>>('/api/Config/groups');
}

export function getConfigById(id: EntityId) {
  return axios.get<void, ApiResponse<ConfigDto>>(`/api/Config/${id}`);
}

export function addConfig(req: CreateConfigRequest) {
  return axios.post<CreateConfigRequest, ApiResponse<ConfigDto>>(
    '/api/Config',
    req
  );
}

export function updateConfig(req: UpdateConfigRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateConfigRequest, 'id'>, ApiResponse<ConfigDto>>(
    `/api/Config/${id}`,
    body
  );
}

export function deleteConfig(id: EntityId) {
  return axios.delete<EntityId, ApiResponse<void>>(`/api/Config/${id}`);
}
