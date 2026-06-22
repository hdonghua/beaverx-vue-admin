import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const TICKET: AppRouteRecordRaw = {
  path: '/ticket',
  name: 'ticket',
  component: DEFAULT_LAYOUT,
  redirect: { name: 'WorkTicketList' },
  meta: {
    locale: 'menu.ticket',
    requiresAuth: true,
    icon: 'icon-customer-service',
    order: 4,
  },
  children: [
    {
      path: 'work',
      name: 'WorkTicketList',
      component: () => import('@/views/ticket/work/index.vue'),
      meta: {
        locale: 'menu.ticket.work',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'process',
      name: 'WorkTicketProcess',
      component: () => import('@/views/ticket/process/index.vue'),
      meta: {
        locale: 'menu.ticket.process',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default TICKET;
