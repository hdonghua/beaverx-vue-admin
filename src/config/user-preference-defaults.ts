/** 用户可在「页面配置」中修改的项，默认值（首次访问 / 恢复默认时使用） */
export const userPreferenceDefaults = {
  theme: 'light',
  themeColor: '#165DFF',
  colorWeak: false,
  menuDark: true,
  navbar: true,
  menu: true,
  topMenu: false,
  menuCollapse: false,
  footer: false,
  tabBar: true,
  menuWidth: 220,
} as const;

export type UserPreferenceDefaults = typeof userPreferenceDefaults;

export const USER_PREFERENCE_KEYS = Object.keys(
  userPreferenceDefaults
) as (keyof UserPreferenceDefaults)[];
