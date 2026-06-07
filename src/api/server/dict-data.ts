import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';

export interface DictDataDto {
  id: number;
  dictTypeId: number;
  dictTypeCode: string;
  label: string;
  value: string;
  sort: number;
  isEnabled: boolean;
  cssClass?: string | null;
  listClass?: string | null;
  remark?: string | null;
  creationTime: string;
}

export interface DictOptionDto {
  label: string;
  value: string;
  listClass?: string | null;
}

export interface QueryDictDataRequest {
  dictTypeId?: number;
  typeCode?: string;
  keyword?: string;
  isEnabled?: boolean;
}

export interface CreateDictDataRequest {
  dictTypeId: number;
  label: string;
  value: string;
  sort?: number;
  isEnabled?: boolean;
  cssClass?: string;
  listClass?: string;
  remark?: string;
}

export interface UpdateDictDataRequest {
  id: number;
  label?: string;
  value?: string;
  sort?: number;
  isEnabled?: boolean;
  cssClass?: string;
  listClass?: string;
  remark?: string;
}

export function queryDictDataList(req: QueryDictDataRequest) {
  return axios.get<QueryDictDataRequest, ApiResponse<DictDataDto[]>>(
    '/api/DictData/list',
    { params: req }
  );
}

export function getDictOptions(typeCode: string) {
  return axios.get<void, ApiResponse<DictOptionDto[]>>(
    `/api/DictData/options/${typeCode}`
  );
}

export function addDictData(req: CreateDictDataRequest) {
  return axios.post<CreateDictDataRequest, ApiResponse<DictDataDto>>(
    '/api/DictData',
    req
  );
}

export function updateDictData(req: UpdateDictDataRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateDictDataRequest, 'id'>, ApiResponse<DictDataDto>>(
    `/api/DictData/${id}`,
    body
  );
}

export function deleteDictData(id: number) {
  return axios.delete<number, ApiResponse<void>>(`/api/DictData/${id}`);
}
