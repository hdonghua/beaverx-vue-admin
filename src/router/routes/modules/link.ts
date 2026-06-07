import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

/** 外链 iframe 的兜底父级布局（无静态目录可挂载时使用） */
const LINK: AppRouteRecordRaw = {
  path: '/link',
  name: 'linkHost',
  component: DEFAULT_LAYOUT,
  meta: {
    requiresAuth: true,
    hideInMenu: true,
    roles: ['*'],
  },
  children: [],
};

export default LINK;
