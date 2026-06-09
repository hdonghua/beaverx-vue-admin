/**
 * 字典类型编码（与后端 DictType.Code 一致）
 */
export const DictTypeCodes = {
  SysMenuType: 'sys_menu_type',
} as const;

export type DictTypeCode = (typeof DictTypeCodes)[keyof typeof DictTypeCodes];

/** 菜单类型枚举值，与后端 MenuType 及字典 sys_menu_type 的 value 一致 */
export enum SysMenuType {
  Directory = 0,
  Menu = 1,
  Button = 2,
}
