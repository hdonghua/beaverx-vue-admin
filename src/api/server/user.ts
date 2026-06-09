import { PagedResultDto, QueryPageRequest } from '@/types/page';
import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';
export interface CreateUserRequest {
  userName: string;
  password: string;
  nickName?: string;
  email?: string;
  phone?: string;
  isEnabled?: boolean;
  roleIds?: number[];
}

export interface QueryUserPageRequest extends QueryPageRequest {
  userName?: string | null;
}

export interface UserDto {
  id: number;
  userName: string;
  nickName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isEnabled: boolean;
  creationTime: string;
  roleIds: number[];
  roleNames: string[];
}

export interface UpdateUserRequest {
  id: number;
  nickName?: string;
  email?: string;
  phone?: string;
  isEnabled?: boolean;
}

export interface AssignRoleRequest {
  userId: number;
  roleIds: number[];
}

export interface ResetPasswordRequest {
  userId: number;
  newPassword: string;
}

/** 用户列表 */
export function queryUserPage(req: QueryUserPageRequest) {
  return axios.get<QueryUserPageRequest, ApiResponse<PagedResultDto<UserDto>>>(
    '/api/User/list',
    {
      params: {
        keyword: req.userName || undefined,
        page: req.current,
        pageSize: req.pageSize,
      },
    }
  );
}

/** 新增用户 */
export function addUser(req: CreateUserRequest) {
  return axios.post<CreateUserRequest, ApiResponse<UserDto>>('/api/User', req);
}

/** 更新用户 */
export function updateUser(req: UpdateUserRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateUserRequest, 'id'>, ApiResponse<UserDto>>(
    `/api/User/${id}`,
    body
  );
}

/** 分配角色 */
export function assignRole(req: AssignRoleRequest) {
  return axios.put<AssignRoleRequest, ApiResponse<void>>(
    `/api/User/${req.userId}/roles`,
    { roleIds: req.roleIds }
  );
}

/** 获取用户详情（含已分配角色） */
export function getUserById(userId: number) {
  return axios.get<number, ApiResponse<UserDto>>(`/api/User/${userId}`);
}

/** 重置密码 */
export function resetPassword(req: ResetPasswordRequest) {
  return axios.put<{ newPassword: string }, ApiResponse<void>>(
    `/api/User/${req.userId}/password`,
    { newPassword: req.newPassword }
  );
}

