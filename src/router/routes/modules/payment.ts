// import { DEFAULT_LAYOUT } from '../base';
// import { AppRouteRecordRaw } from '../types';

// const PAYMENT: AppRouteRecordRaw = {
//   path: '/payment',
//   name: 'payment',
//   component: DEFAULT_LAYOUT,
//   redirect: { name: 'PaymentOrderList' },
//   meta: {
//     locale: 'menu.payment',
//     requiresAuth: true,
//     icon: 'icon-alipay-circle',
//     order: 5,
//   },
//   children: [
//     {
//       path: 'channel',
//       name: 'PaymentChannelList',
//       component: () => import('@/views/payment/channel/index.vue'),
//       meta: {
//         locale: 'menu.payment.channel',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'order',
//       name: 'PaymentOrderList',
//       component: () => import('@/views/payment/order/index.vue'),
//       meta: {
//         locale: 'menu.payment.order',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//     {
//       path: 'refund',
//       name: 'PaymentRefundList',
//       component: () => import('@/views/payment/refund/index.vue'),
//       meta: {
//         locale: 'menu.payment.refund',
//         requiresAuth: true,
//         roles: ['*'],
//       },
//     },
//   ],
// };

// export default PAYMENT;
