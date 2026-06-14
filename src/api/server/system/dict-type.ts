import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { QueryPageRequest, PagedResultDto } from '@/types/page';

export interface QueryDictTypePageRequest extends QueryPageRequest {
  keyword?: string | null;
  isEnabled?: boolean | null;
}

export interface DictTypeDto {
  id: EntityId;
  code: string;
  name: string;
  remark?: string | null;
  isEnabled: boolean;
  creationTime: string;
}

export interface CreateDictTypeRequest {
  code: string;
  name: string;
  remark?: string;
  isEnabled?: boolean;
}

export interface UpdateDictTypeRequest {
  id: EntityId;
  name?: string;
  remark?: string;
  isEnabled?: boolean;
}

export function queryDictTypePage(req: QueryDictTypePageRequest) {
  return axios.get<
    QueryDictTypePageRequest,
    ApiResponse<PagedResultDto<DictTypeDto>>
  >('/api/DictType/list', {
    params: {
      keyword: req.keyword || undefined,
      isEnabled: req.isEnabled ?? undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

export function getDictTypeById(id: EntityId) {
  return axios.get<void, ApiResponse<DictTypeDto>>(`/api/DictType/${id}`);
}

export function addDictType(req: CreateDictTypeRequest) {
  return axios.post<CreateDictTypeRequest, ApiResponse<DictTypeDto>>(
    '/api/DictType',
    req
  );
}

export function updateDictType(req: UpdateDictTypeRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateDictTypeRequest, 'id'>, ApiResponse<DictTypeDto>>(
    `/api/DictType/${id}`,
    body
  );
}

export function deleteDictType(id: EntityId) {
  return axios.delete<EntityId, ApiResponse<void>>(`/api/DictType/${id}`);
}
