import type { MenuDto } from '@/api/server/rbac/menu';
import type { EntityId } from '@/types/entity-id';

export interface MenuTreeNode {
  key: EntityId;
  title: string;
  children?: MenuTreeNode[];
}

export function collectAllMenuIds(menus: MenuDto[]): EntityId[] {
  const ids: EntityId[] = [];
  const walk = (items: MenuDto[]) => {
    items.forEach((menu) => {
      ids.push(menu.id);
      if (menu.children?.length) {
        walk(menu.children);
      }
    });
  };
  walk(menus);
  return ids;
}

/** 转为 Arco Tree 节点（剔除 icon 等非渲染函数字段，避免 renderFunc 报错） */
export function toMenuTreeNodes(menus: MenuDto[]): MenuTreeNode[] {
  return menus.map((menu) => {
    const node: MenuTreeNode = {
      key: menu.id,
      title: menu.name,
    };
    if (menu.children?.length) {
      node.children = toMenuTreeNodes(menu.children);
    }
    return node;
  });
}

/** 父子关联模式下，补全已全选子节点对应的父级 ID，便于树组件正确勾选 */
export function normalizeCheckedMenuIds(
  menus: MenuDto[],
  menuIds: EntityId[]
): EntityId[] {
  const checked = new Set(menuIds);

  const visit = (item: MenuDto): boolean => {
    if (!item.children?.length) {
      return checked.has(item.id);
    }
    const allChildrenChecked = item.children.every((child) => visit(child));
    if (allChildrenChecked) {
      checked.add(item.id);
    }
    return allChildrenChecked || checked.has(item.id);
  };

  menus.forEach(visit);
  return [...checked];
}

/** 保存时收集菜单 ID（父子关联时自动带上祖先节点） */
export function collectMenuIdsForSave(
  menus: MenuDto[],
  checkedKeys: Array<string | number>,
  linked: boolean
): EntityId[] {
  const result = new Set(checkedKeys.map((id) => String(id)));
  if (!linked) {
    return [...result];
  }

  const walk = (items: MenuDto[], ancestors: EntityId[]) => {
    items.forEach((item) => {
      const path = [...ancestors, item.id];
      if (result.has(item.id)) {
        path.forEach((id) => result.add(id));
      }
      if (item.children?.length) {
        walk(item.children, path);
      }
    });
  };

  walk(menus, []);
  return [...result];
}
