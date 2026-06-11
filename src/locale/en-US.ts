import localeMessageBox from '@/components/message-box/locale/en-US';
import localeExportBox from '@/components/export-box/locale/en-US';
import localeMenuSearch from '@/components/menu-search/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';
import localeHome from '@/views/home/locale/en-US';
import locale403 from '@/views/exception/403/locale/en-US';
import locale404 from '@/views/exception/404/locale/en-US';
import locale500 from '@/views/exception/500/locale/en-US';
import localeUserSetting from '@/views/user/setting/locale/en-US';
import localeSystem from '@/views/system/locale/en-US';
import localeSiteMessage from '@/views/system/message/locale/en-US';
import localeSettings from './en-US/settings';

export default {
  'menu.exception': 'Exception',
  'menu.user': 'User Center',
  'menu.system': 'System',
  'menu.system.userList': 'User Management',
  'menu.system.roleList': 'Role Management',
  'menu.system.menuList': 'Menu Management',
  'menu.system.dictList': 'Dictionary Management',
  'menu.system.configList': 'Config Management',
  'menu.system.jobList': 'Scheduled Jobs',
  'menu.system.messageSend': 'Send Site Message',
  'menu.payment': 'Payment',
  'menu.payment.channel': 'Payment Channels',
  'menu.payment.order': 'Payment Orders',
  'menu.payment.refund': 'Refund Records',
  'navbar.action.locale': 'Switch to English',
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
};
