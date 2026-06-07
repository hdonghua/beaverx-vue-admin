import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';

export enum MenuType {
  Directory = 0,
  Menu = 1,
  Button = 2,
}

export interface MenuDto {
  id: number;
  parentId?: number | null;
  name: string;
  menuType: MenuType;
  perms?: string | null;
  path?: string | null;
  component?: string | null;
  icon?: string | null;
  sort: number;
  isVisible: boolean;
  isEnabled: boolean;
  children?: MenuDto[];
}

export interface CreateMenuRequest {
  parentId?: number | null;
  name: string;
  menuType: MenuType;
  perms?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
}

export interface UpdateMenuRequest {
  id: number;
  parentId?: number | null;
  name?: string;
  menuType?: MenuType;
  perms?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  isVisible?: boolean;
  isEnabled?: boolean;
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
export function deleteMenu(menuId: number) {
  return axios.delete<number, ApiResponse<void>>(`/api/Menu/${menuId}`);
}

/** 获取当前用户路由菜单 */
export function getUserMenus() {
  return axios.get<void, ApiResponse<MenuDto[]>>('/api/Auth/menus');
}
