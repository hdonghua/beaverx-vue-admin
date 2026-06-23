// import { DEFAULT_LAYOUT } from '../base';
// import { AppRouteRecordRaw } from '../types';

// const SYSTEM: AppRouteRecordRaw = {
//   path: '/system',
//   name: 'system',
//   component: DEFAULT_LAYOUT,
//   meta: {
//     locale: 'menu.system',
//     requiresAuth: true,
//     icon: 'icon-settings',
//     order: 0,
//   },
//   children: [
//     {
//       path: 'user',
//       name: 'UserList',
//       component: () => import('@/views/system/user/index.vue'),
//       meta: {
//         locale: 'menu.system.userList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'role',
//       name: 'RoleList',
//       component: () => import('@/views/system/role/index.vue'),
//       meta: {
//         locale: 'menu.system.roleList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'menu',
//       name: 'MenuList',
//       component: () => import('@/views/system/menu/index.vue'),
//       meta: {
//         locale: 'menu.system.menuList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'dict',
//       name: 'DictList',
//       component: () => import('@/views/system/dict/index.vue'),
//       meta: {
//         locale: 'menu.system.dictList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'config',
//       name: 'ConfigList',
//       component: () => import('@/views/system/config/index.vue'),
//       meta: {
//         locale: 'menu.system.configList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'job',
//       name: 'ScheduledJobList',
//       component: () => import('@/views/system/job/index.vue'),
//       meta: {
//         locale: 'menu.system.jobList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'message',
//       name: 'SiteMessageSend',
//       component: () => import('@/views/system/message/send.vue'),
//       meta: {
//         locale: 'menu.system.messageSend',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'online-user',
//       name: 'OnlineUserList',
//       component: () => import('@/views/system/online-user/index.vue'),
//       meta: {
//         locale: 'menu.system.onlineUserList',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//   ],
// };

// export default SYSTEM;
