import type { RouteRecordRaw } from 'vue-router';
import { cloneDeep } from 'lodash';
import appClientMenus from '@/router/app-menus';
import { MenuDto, MenuType } from '@/api/server/menu';

/** 后端菜单 path -> 前端路由 name */
const PATH_TO_ROUTE_NAME: Record<string, string> = {
  '/system': 'system',
  '/system/user': 'UserList',
  '/system/users': 'UserList',
  '/system/role': 'RoleList',
  '/system/roles': 'RoleList',
  '/system/menu': 'MenuList',
  '/system/menus': 'MenuList',
};

/** 从后端菜单树收集允许展示的前端路由 name */
export function collectAllowedRouteNames(menus: MenuDto[]): Set<string> {
  const names = new Set<string>();

  const walk = (items: MenuDto[]) => {
    items.forEach((menu) => {
      if (menu.menuType !== MenuType.Button && menu.path) {
        const routeName = PATH_TO_ROUTE_NAME[menu.path];
        if (routeName) {
          names.add(routeName);
        }
      }
      if (menu.children?.length) {
        walk(menu.children);
      }
    });
  };

  walk(menus);

  if (
    names.has('UserList') ||
    names.has('RoleList') ||
    names.has('MenuList')
  ) {
    names.add('system');
  }

  return names;
}

/** 按后端授权过滤本地静态菜单，保留 Arco 需要的 meta/icon/locale 结构 */
export function filterClientMenusByAllowedNames(
  routes: RouteRecordRaw[],
  allowedNames: Set<string>
): RouteRecordRaw[] {
  return routes.reduce<RouteRecordRaw[]>((result, route) => {
    const routeName = route.name ? String(route.name) : '';
    const filteredChildren = route.children?.length
      ? filterClientMenusByAllowedNames(route.children, allowedNames)
      : [];

    const isAllowed = routeName && allowedNames.has(routeName);
    if (isAllowed || filteredChildren.length > 0) {
      const item: RouteRecordRaw = { ...route };
      if (filteredChildren.length > 0) {
        item.children = filteredChildren;
      } else {
        delete item.children;
      }
      result.push(item);
    }
    return result;
  }, []);
}

/** 将后端菜单转为前端侧边栏菜单（基于本地路由配置过滤） */
export function transformServerMenus(menus: MenuDto[]): RouteRecordRaw[] {
  const allowedNames = collectAllowedRouteNames(menus);
  return filterClientMenusByAllowedNames(
    cloneDeep(appClientMenus) as RouteRecordRaw[],
    allowedNames
  );
}

/** 从已过滤的侧边栏菜单中取第一个可访问叶子路由 */
export function getFirstAccessibleRouteName(
  menus: RouteRecordRaw[]
): string | null {
  const preferredOrder = ['UserList', 'RoleList', 'MenuList'];
  const availableNames = flattenRouteNames(menus);

  const preferred = preferredOrder.find((name) => availableNames.includes(name));
  if (preferred) {
    return preferred;
  }

  const walk = (routes: RouteRecordRaw[]): string | null => {
    for (const route of routes) {
      if (route.children?.length) {
        const childName = walk(route.children);
        if (childName) {
          return childName;
        }
      } else if (route.name) {
        return String(route.name);
      }
    }
    return null;
  };

  return walk(menus);
}

export function flattenRouteNames(routes: RouteRecordRaw[]): string[] {
  const names: string[] = [];
  const walk = (items: RouteRecordRaw[]) => {
    items.forEach((route) => {
      if (route.name) {
        names.push(String(route.name));
      }
      if (route.children?.length) {
        walk(route.children);
      }
    });
  };
  walk(routes);
  return names;
}
