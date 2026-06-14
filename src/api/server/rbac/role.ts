import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { QueryPageRequest, PagedResultDto } from '@/types/page';

export interface RoleOptionDto {
  id: EntityId;
  name: string;
  code: string;
}

export interface QueryRolePageRequest extends QueryPageRequest {
  name?: string | null;
}

export interface RoleDto {
  id: EntityId;
  code: string;
  name: string;
  description?: string | null;
  sort: number;
  isEnabled: boolean;
  creationTime: string;
  menuIds: EntityId[];
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
  sort?: number;
  isEnabled?: boolean;
}

export interface UpdateRoleRequest {
  id: EntityId;
  name?: string;
  description?: string;
  sort?: number;
  isEnabled?: boolean;
}

/** 角色详情 */
export function getRoleById(id: EntityId) {
  return axios.get<void, ApiResponse<RoleDto>>(`/api/Role/${id}`);
}

/** 角色列表 */
export function queryRolePage(req: QueryRolePageRequest) {
  return axios.get<
    QueryRolePageRequest,
    ApiResponse<PagedResultDto<RoleDto>>
  >('/api/Role/list', {
    params: {
      keyword: req.name || undefined,
      page: req.current,
      pageSize: req.pageSize,
    },
  });
}

/** 查询角色选项 */
export async function queryRoleOptions() {
  const { data } = await queryRolePage({ current: 1, pageSize: 1000 });
  const options: RoleOptionDto[] = data.items.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
  }));
  return { data: options };
}

/** 新增角色 */
export function addRole(req: CreateRoleRequest) {
  return axios.post<CreateRoleRequest, ApiResponse<RoleDto>>('/api/Role', req);
}

/** 更新角色 */
export function updateRole(req: UpdateRoleRequest) {
  const { id, ...body } = req;
  return axios.put<Omit<UpdateRoleRequest, 'id'>, ApiResponse<RoleDto>>(
    `/api/Role/${id}`,
    body
  );
}

/** 删除角色 */
export function deleteRole(id: EntityId) {
  return axios.delete<EntityId, ApiResponse<void>>(`/api/Role/${id}`);
}

/** 分配菜单 */
export function assignRoleMenus(roleId: EntityId, menuIds: EntityId[]) {
  return axios.put<{ menuIds: EntityId[] }, ApiResponse<void>>(
    `/api/Role/${roleId}/menus`,
    { menuIds }
  );
}
