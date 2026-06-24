import type { RouteRecordRaw } from 'vue-router';

export interface AppState {
  systemName: string;
  footerText: string;
  theme: string;
  colorWeak: boolean;
  navbar: boolean;
  navbarLocale: boolean;
  navbarSettings: boolean;
  menu: boolean;
  topMenu: boolean;
  hideMenu: boolean;
  menuCollapse: boolean;
  footer: boolean;
  loginFooter: boolean;
  themeColor: string;
  menuWidth: number;
  globalSettings: boolean;
  device: string;
  tabBar: boolean;
  avatarEnabled: boolean;
  menuFromServer: boolean;
  /** 本会话是否已请求过服务端菜单（空菜单也为 true，避免重复拉取） */
  serverMenuFetched: boolean;
  serverMenu: RouteRecordRaw[];
  allowedRouteNames: string[];
  registeredServerRouteNames: string[];
  [key: string]: unknown;
}
