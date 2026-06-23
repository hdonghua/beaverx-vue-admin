import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const COMPONENTS: AppRouteRecordRaw = {
  path: '/components',
  name: 'components',
  component: DEFAULT_LAYOUT,
  redirect: { name: 'ComponentOverview' },
  meta: {
    locale: 'menu.components',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 3,
    staticMenu: true,
    roles: ['*'],
  },
  children: [
    {
      path: 'overview',
      name: 'ComponentOverview',
      component: () => import('@/views/components/overview/index.vue'),
      meta: {
        locale: 'menu.components.overview',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'dict-select',
      name: 'ComponentDictSelect',
      component: () => import('@/views/components/dict-select/index.vue'),
      meta: {
        locale: 'menu.components.dictSelect',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'dict-tag',
      name: 'ComponentDictTag',
      component: () => import('@/views/components/dict-tag/index.vue'),
      meta: {
        locale: 'menu.components.dictTag',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'svg-icon',
      name: 'ComponentSvgIcon',
      component: () => import('@/views/components/svg-icon/index.vue'),
      meta: {
        locale: 'menu.components.svgIcon',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'rich-text',
      name: 'ComponentRichText',
      component: () => import('@/views/components/rich-text/index.vue'),
      meta: {
        locale: 'menu.components.richText',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'signature-pad',
      name: 'ComponentSignaturePad',
      component: () => import('@/views/components/signature-pad/index.vue'),
      meta: {
        locale: 'menu.components.signaturePad',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'back-to-top',
      name: 'ComponentBackToTop',
      component: () => import('@/views/components/back-to-top/index.vue'),
      meta: {
        locale: 'menu.components.backToTop',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'editable-text',
      name: 'ComponentEditableText',
      component: () => import('@/views/components/editable-text/index.vue'),
      meta: {
        locale: 'menu.components.editableText',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'roll-loading',
      name: 'ComponentRollLoading',
      component: () => import('@/views/components/roll-loading/index.vue'),
      meta: {
        locale: 'menu.components.rollLoading',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'loading-layer',
      name: 'ComponentLoadingLayer',
      component: () => import('@/views/components/loading-layer/index.vue'),
      meta: {
        locale: 'menu.components.loadingLayer',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'permission',
      name: 'ComponentPermission',
      component: () => import('@/views/components/permission/index.vue'),
      meta: {
        locale: 'menu.components.permission',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default COMPONENTS;
