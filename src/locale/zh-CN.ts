import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeExportBox from '@/components/export-box/locale/zh-CN';
import localeMenuSearch from '@/components/menu-search/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';
import localeHome from '@/views/home/locale/zh-CN';
import locale403 from '@/views/exception/403/locale/zh-CN';
import locale404 from '@/views/exception/404/locale/zh-CN';
import locale500 from '@/views/exception/500/locale/zh-CN';
import localeUserSetting from '@/views/user/setting/locale/zh-CN';
import localeSystem from '@/views/system/locale/zh-CN';
import localeSiteMessage from '@/views/system/message/locale/zh-CN';
import localeOnlineUser from '@/views/system/online-user/locale/zh-CN';
import localeSettings from './zh-CN/settings';

export default {
  'searchTable.actions.refresh': '刷新',
  'searchTable.form.search': '搜索',
  'searchTable.form.reset': '重置',
  'searchTable.actions.density': '密度',
  'searchTable.size.mini': '窄',
  'searchTable.size.small': '小',
  'searchTable.size.medium': '中',
  'searchTable.size.large': '大',
  'searchTable.actions.columnSetting': '列设置',
  'searchTable.operation.create': '新增',
  'searchTable.columns.index': '序号',
  'searchTable.columns.operations': '操作',
  'menu.exception': '异常页',
  'menu.user': '个人中心',
  'menu.system': '系统管理',
  'menu.system.userList': '用户管理',
  'menu.system.roleList': '角色管理',
  'menu.system.menuList': '菜单管理',
  'menu.system.dictList': '字典管理',
  'menu.system.configList': '配置管理',
  'menu.system.jobList': '定时任务',
  'menu.system.messageSend': '发送站内信',
  'menu.system.onlineUserList': '在线用户',
  'menu.payment': '支付管理',
  'menu.payment.channel': '支付渠道',
  'menu.payment.order': '支付订单',
  'menu.payment.refund': '退款记录',
  'menu.ticket': '工单管理',
  'menu.ticket.work': '工单列表',
  'menu.ticket.process': '工单处理',
  'navbar.action.locale': '切换为中文',
  ...localeSettings,
  ...localeMessageBox,
  ...localeExportBox,
  ...localeMenuSearch,
  ...localeLogin,
  ...localeHome,
  ...locale403,
  ...locale404,
  ...locale500,
  ...localeUserSetting,
  ...localeSystem,
  ...localeSiteMessage,
  ...localeOnlineUser,
};
