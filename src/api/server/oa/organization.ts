import axios from 'axios';
import type { EntityId } from '@/types/entity-id';
import type { PagedResultDto } from '@/types/page';
import type { ApiResponse } from '@/utils/request';

export interface DepartmentItem {
  id: EntityId;
  name: string;
  code?: string | null;
  parentId?: EntityId | null;
  children?: DepartmentItem[];
}

export interface DepartmentDetails {
  id: EntityId;
  name: string;
  code?: string | null;
  parentId?: EntityId | null;
  parentName?: string | null;
  leaderUserId?: EntityId | null;
  leaderName?: string | null;
  memberCount: number;
  sort: number;
  isEnabled: boolean;
}

export interface DepartmentMember {
  userId: EntityId;
  userName: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
  isPrimary: boolean;
  isLeader: boolean;
}

export interface UserOption {
  id: EntityId;
  name: string;
  userName?: string | null;
  avatar?: string | null;
}

export interface SaveDepartmentRequest {
  parentId?: EntityId | null;
  name: string;
  code?: string | null;
  sort: number;
  isEnabled: boolean;
}

const baseUrl = '/api/OaOrganization';

export const getDepartments = () =>
  axios.get<void, ApiResponse<DepartmentItem[]>>(`${baseUrl}/departments`);

export const getDepartment = (departmentId: EntityId) =>
  axios.get<void, ApiResponse<DepartmentDetails>>(`${baseUrl}/departments/${departmentId}`);

export const getDepartmentMembers = (
  departmentId: EntityId,
  params: { keyword?: string; page: number; pageSize: number }
) => axios.get<void, ApiResponse<PagedResultDto<DepartmentMember>>>(
  `${baseUrl}/departments/${departmentId}/members`,
  { params }
);

export const searchCompanyUsers = (keyword = '') =>
  axios.get<void, ApiResponse<UserOption[]>>(`${baseUrl}/users/search`, { params: { keyword } });

export const createDepartment = (data: SaveDepartmentRequest) =>
  axios.post<SaveDepartmentRequest, ApiResponse<EntityId>>(`${baseUrl}/departments`, data);

export const updateDepartment = (departmentId: EntityId, data: SaveDepartmentRequest) =>
  axios.put(`${baseUrl}/departments/${departmentId}`, data);

export const deleteDepartment = (departmentId: EntityId) =>
  axios.delete(`${baseUrl}/departments/${departmentId}`);

export const addDepartmentMembers = (departmentId: EntityId, userIds: EntityId[]) =>
  axios.post(`${baseUrl}/departments/${departmentId}/members`, { userIds });

export const removeDepartmentMember = (departmentId: EntityId, userId: EntityId) =>
  axios.delete(`${baseUrl}/departments/${departmentId}/members/${userId}`);

export const setDepartmentLeader = (departmentId: EntityId, leaderUserId?: EntityId) =>
  axios.put(`${baseUrl}/departments/${departmentId}/leader`, { leaderUserId: leaderUserId || null });
