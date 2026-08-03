import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { SysMenuType } from '@/constants/dict-types';

export { SysMenuType as MenuType } from '@/constants/dict-types';
export { SysMenuType };

export interface MenuDto {
  id: EntityId;
  parentId?: EntityId | null;
  name: string;
  menuType: SysMenuType;
  perms?: string | null;
  path?: string | null;
  component?: string | null;
  icon?: string | null;
  sort: number;
  isVisible: boolean;
  isEnabled: boolean;
  isExternal: boolean;
  isCache: boolean;
  children?: MenuDto[];
}

export interface CreateMenuRequest {
  parentId?: EntityId | null;
  name: string;
  menuType: SysMenuType;
  perms?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
  isExternal?: boolean;
  isCache?: boolean;
}

export interface UpdateMenuRequest {
  id: EntityId;
  parentId?: EntityId | null;
  name?: string;
  menuType?: SysMenuType;
  perms?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
  isExternal?: boolean;
  isCache?: boolean;
}

export interface QueryMenuRequest {
  title?: string;
}

/** 添加菜单 */
export function addMenu(data: CreateMenuRequest) {
  return axios.post<CreateMenuRequest, ApiResponse<MenuDto>>('/api/Menu', data);
}

/** 查询菜单树 */
export function queryMenus(_params?: QueryMenuRequest) {
  return axios.get<void, ApiResponse<MenuDto[]>>('/api/Menu/tree');
}

/** 更新菜单 */
export function updateMenu(data: UpdateMenuRequest) {
  const { id, ...body } = data;
  return axios.put<Omit<UpdateMenuRequest, 'id'>, ApiResponse<MenuDto>>(
    `/api/Menu/${id}`,
    body
  );
}

/** 删除菜单 */
export function deleteMenu(menuId: EntityId) {
  return axios.delete<EntityId, ApiResponse<void>>(`/api/Menu/${menuId}`);
}

/** 获取当前用户路由菜单 */
export function getUserMenus() {
  return axios.get<void, ApiResponse<MenuDto[]>>('/api/Auth/menus');
}
