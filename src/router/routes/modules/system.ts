import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const SYSTEM: AppRouteRecordRaw = {
  path: '/system',
  name: 'system',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.system',
    requiresAuth: true,
    icon: 'icon-dashboard',
    order: 0,
  },
  children: [
    {
      path: 'user',
      name: 'UserList',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        locale: 'menu.system.userList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'role',
      name: 'RoleList',
      component: () => import('@/views/system/role/index.vue'),
      meta: {
        locale: 'menu.system.roleList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'menu',
      name: 'MenuList',
      component: () => import('@/views/system/menu/index.vue'),
      meta: {
        locale: 'menu.system.menuList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default SYSTEM;
