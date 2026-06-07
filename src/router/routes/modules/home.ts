import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const HOME: AppRouteRecordRaw = {
  path: '/home',
  name: 'home',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.home',
    requiresAuth: true,
    hideInMenu: true,
    order: -1,
  },
  children: [
    {
      path: '',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        locale: 'menu.home',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
  ],
};

export default HOME;
