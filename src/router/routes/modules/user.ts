import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const USER: AppRouteRecordRaw = {
  path: '/user',
  name: 'user',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.user',
    icon: 'icon-user',
    requiresAuth: true,
    order: 7,
  },
  children: [
    {
      path: 'info',
      name: 'Info',
      component: () => import('@/views/user/info/index.vue'),
      meta: {
        locale: 'menu.user.info',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'center',
      name: 'Setting',
      component: () => import('@/views/user/setting/index.vue'),
      meta: {
        locale: 'menu.user.center',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
  ],
};

export default USER;
