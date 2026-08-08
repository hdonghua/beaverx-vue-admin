import type { RouteRecordRaw } from 'vue-router';

/** 仅 settings.json 配置，用户不可在界面修改 */
export interface FixedAppSettings {
  systemName: string;
  footerText: string;
  loginFooter: boolean;
  navbarSettings: boolean;
  menuFromServer: boolean;
  avatarEnabled: boolean;
}

/** 用户可在「页面配置」中修改，并持久化到 localStorage */
export interface UserPreferences {
  theme: string;
  themeColor: string;
  colorWeak: boolean;
  menuDark: boolean;
  navbar: boolean;
  menu: boolean;
  topMenu: boolean;
  menuCollapse: boolean;
  footer: boolean;
  tabBar: boolean;
  menuWidth: number;
}

/** 运行时状态，不持久化 */
export interface RuntimeAppState {
  hideMenu: boolean;
  device: string;
  globalSettings: boolean;
  serverMenuFetched: boolean;
  /** 当前 serverMenu 所属用户，用于检测切换账号后需重新拉菜单 */
  menuOwnerId: string | null;
  serverMenu: RouteRecordRaw[];
  allowedRouteNames: string[];
  registeredServerRouteNames: string[];
}

export type AppState = FixedAppSettings &
  UserPreferences &
  RuntimeAppState & {
    [key: string]: unknown;
  };
