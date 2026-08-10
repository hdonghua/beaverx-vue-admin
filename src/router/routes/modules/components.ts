import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const COMPONENTS: AppRouteRecordRaw = {
  path: '/components',
  name: 'components',
  component: DEFAULT_LAYOUT,
  meta: {
    title: '组件概览',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 99,
    staticMenu: true,
    roles: ['*'],
  },
  children: [
    {
      path: 'dict-select',
      name: 'ComponentDictSelect',
      component: () => import('@/views/components/dict-select/index.vue'),
      meta: {
        title: '字典选择',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'dict-tag',
      name: 'ComponentDictTag',
      component: () => import('@/views/components/dict-tag/index.vue'),
      meta: {
        title: '字典标签',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'svg-icon',
      name: 'ComponentSvgIcon',
      component: () => import('@/views/components/svg-icon/index.vue'),
      meta: {
        title: 'SVG 图标',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'rich-text',
      name: 'ComponentRichText',
      component: () => import('@/views/components/rich-text/index.vue'),
      meta: {
        title: '富文本',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'signature-pad',
      name: 'ComponentSignaturePad',
      component: () => import('@/views/components/signature-pad/index.vue'),
      meta: {
        title: '签名板',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'back-to-top',
      name: 'ComponentBackToTop',
      component: () => import('@/views/components/back-to-top/index.vue'),
      meta: {
        title: '回到顶部',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'editable-text',
      name: 'ComponentEditableText',
      component: () => import('@/views/components/editable-text/index.vue'),
      meta: {
        title: '可编辑文本',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'roll-loading',
      name: 'ComponentRollLoading',
      component: () => import('@/views/components/roll-loading/index.vue'),
      meta: {
        title: '滚动加载',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'loading-layer',
      name: 'ComponentLoadingLayer',
      component: () => import('@/views/components/loading-layer/index.vue'),
      meta: {
        title: '加载遮罩',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'permission',
      name: 'ComponentPermission',
      component: () => import('@/views/components/permission/index.vue'),
      meta: {
        title: '权限指令',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default COMPONENTS;
