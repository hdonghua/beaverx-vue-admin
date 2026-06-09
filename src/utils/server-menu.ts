import type { RouteRecordRaw } from 'vue-router';
import { cloneDeep } from 'lodash';
import appClientMenus from '@/router/app-menus';
import { DEFAULT_LAYOUT } from '@/router/routes/base';
import { MenuDto, MenuType } from '@/api/server/menu';
import { EXTERNAL_ROUTE_FALLBACK_PARENT } from '@/utils/register-server-routes';

/** 后端菜单 path -> 前端路由 name（内部页面权限校验用） */
const PATH_TO_ROUTE_NAME: Record<string, string> = {
  '/system': 'system',
  '/system/user': 'UserList',
  '/system/role': 'RoleList',
  '/system/menu': 'MenuList',
  '/system/dict': 'DictList',
  '/system/config': 'ConfigList',
  '/system/message': 'SiteMessageSend',
  '/payment': 'payment',
  '/payment/channel': 'PaymentChannelList',
  '/payment/order': 'PaymentOrderList',
  '/payment/refund': 'PaymentRefundList',
};

function formatMenuIcon(icon?: string | null) {
  if (!icon) {
    return undefined;
  }
  return icon.startsWith('icon-') ? icon : `icon-${icon}`;
}

function buildStaticPathMap(routes: RouteRecordRaw[], parentPath = '') {
  const map = new Map<string, RouteRecordRaw>();

  routes.forEach((route) => {
    const routePath = String(route.path || '');
    const fullPath = routePath.startsWith('/')
      ? routePath
      : `${parentPath}/${routePath}`.replace(/\/+/g, '/');

    if (routePath) {
      map.set(fullPath, route);
    }

    if (route.children?.length) {
      const childMap = buildStaticPathMap(route.children, fullPath);
      childMap.forEach((value, key) => map.set(key, value));
    }
  });

  return map;
}

/** 侧边栏展示：启用 + 可见 + 非按钮 */
function isSidebarMenu(menu: MenuDto) {
  return (
    menu.isEnabled &&
    menu.isVisible &&
    menu.menuType !== MenuType.Button
  );
}

/** 路由可访问：启用 + 非按钮（隐藏菜单仍可访问） */
function isAccessibleMenu(menu: MenuDto) {
  return menu.isEnabled && menu.menuType !== MenuType.Button;
}

function resolveParentRouteName(
  staticMatch: RouteRecordRaw | undefined,
  parentRouteName?: string
) {
  if (staticMatch?.name) {
    const name = String(staticMatch.name);
    if (!name.startsWith('dir-')) {
      return name;
    }
  }
  return parentRouteName;
}

function toExternalRoute(
  menu: MenuDto,
  parentRouteName?: string
): RouteRecordRaw {
  return {
    path: `external/${menu.id}`,
    name: `external-${menu.id}`,
    meta: {
      requiresAuth: true,
      title: menu.name,
      icon: formatMenuIcon(menu.icon),
      isExternal: true,
      frameSrc: menu.path || '',
      externalParentName: parentRouteName || EXTERNAL_ROUTE_FALLBACK_PARENT,
      order: menu.sort,
      roles: ['*'],
      ignoreCache: true,
    },
  } as RouteRecordRaw;
}

function toVirtualDirectory(
  menu: MenuDto,
  children: RouteRecordRaw[]
): RouteRecordRaw {
  const path = menu.path || `dir-${menu.id}`;
  return {
    path,
    name: `dir-${menu.id}`,
    component: DEFAULT_LAYOUT,
    meta: {
      requiresAuth: true,
      title: menu.name,
      icon: formatMenuIcon(menu.icon),
      order: menu.sort,
      roles: ['*'],
    },
    children,
  };
}

function buildChildrenFromServer(
  serverChildren: MenuDto[],
  staticByPath: Map<string, RouteRecordRaw>,
  parentRouteName?: string
): RouteRecordRaw[] {
  return serverChildren
    .filter(isSidebarMenu)
    .sort((a, b) => a.sort - b.sort)
    .map((menu) => {
      if (menu.menuType === MenuType.Menu) {
        if (menu.isExternal) {
          return toExternalRoute(menu, parentRouteName);
        }

        if (menu.path && staticByPath.has(menu.path)) {
          return cloneDeep(staticByPath.get(menu.path)!);
        }

        return null;
      }

      if (menu.menuType === MenuType.Directory) {
        const staticDir = menu.path ? staticByPath.get(menu.path) : undefined;
        const childParent = resolveParentRouteName(staticDir, parentRouteName);
        const children = buildChildrenFromServer(
          menu.children || [],
          staticByPath,
          childParent
        );
        if (!children.length) {
          return null;
        }
        if (staticDir) {
          return {
            ...cloneDeep(staticDir),
            children,
          };
        }

        return toVirtualDirectory(menu, children);
      }

      return null;
    })
    .filter((route): route is RouteRecordRaw => !!route);
}

/** 将后端菜单转为前端侧边栏菜单（内部页 + 外链） */
export function transformServerMenus(menus: MenuDto[]): RouteRecordRaw[] {
  const staticRoutes = cloneDeep(appClientMenus) as RouteRecordRaw[];
  const staticByPath = buildStaticPathMap(staticRoutes);

  return menus
    .filter((menu) => menu.menuType === MenuType.Directory && isSidebarMenu(menu))
    .sort((a, b) => a.sort - b.sort)
    .map((menu) => {
      const staticDir = menu.path ? staticByPath.get(menu.path) : undefined;
      const parentRouteName = resolveParentRouteName(staticDir);
      const children = buildChildrenFromServer(
        menu.children || [],
        staticByPath,
        parentRouteName
      );

      if (staticDir) {
        return {
          ...cloneDeep(staticDir),
          children,
        };
      }

      return toVirtualDirectory(menu, children);
    })
    .filter((route) => route.children?.length);
}

/** 收集需动态注册的外链路由（含隐藏菜单） */
export function collectExternalRoutesFromMenus(menus: MenuDto[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];
  const staticByPath = buildStaticPathMap(
    cloneDeep(appClientMenus) as RouteRecordRaw[]
  );

  const walk = (items: MenuDto[], parentRouteName?: string) => {
    items
      .filter((menu) => menu.isEnabled)
      .sort((a, b) => a.sort - b.sort)
      .forEach((menu) => {
        if (menu.menuType === MenuType.Menu && menu.isExternal) {
          result.push(toExternalRoute(menu, parentRouteName));
          return;
        }

        if (menu.menuType === MenuType.Directory && menu.children?.length) {
          const staticDir = menu.path ? staticByPath.get(menu.path) : undefined;
          const childParent = resolveParentRouteName(staticDir, parentRouteName);
          walk(menu.children, childParent);
        }
      });
  };

  walk(menus);
  return result;
}

/** 收集可访问路由 name（含隐藏菜单，不含按钮） */
export function collectAllowedRouteNames(menus: MenuDto[]): Set<string> {
  const names = new Set<string>();

  const walk = (items: MenuDto[]) => {
    items.forEach((menu) => {
      if (!isAccessibleMenu(menu)) {
        if (menu.children?.length) {
          walk(menu.children);
        }
        return;
      }

      if (menu.isExternal) {
        names.add(`external-${menu.id}`);
      } else if (menu.path) {
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
    names.has('MenuList') ||
    names.has('DictList') ||
    names.has('ConfigList')
  ) {
    names.add('system');
  }

  if (
    names.has('PaymentChannelList') ||
    names.has('PaymentOrderList') ||
    names.has('PaymentRefundList')
  ) {
    names.add('payment');
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

/** 从已过滤的侧边栏菜单中取第一个可访问叶子路由 */
export function getFirstAccessibleRouteName(
  menus: RouteRecordRaw[]
): string | null {
  const preferredOrder = [
    'UserList',
    'RoleList',
    'MenuList',
    'DictList',
    'ConfigList',
  ];
  const availableNames = flattenRouteNames(menus);

  const preferred = preferredOrder.find((name) => availableNames.includes(name));
  if (preferred) {
    return preferred;
  }

  const walk = (routes: RouteRecordRaw[]): string | null => {
    for (const route of routes) {
      if (route.meta?.isExternal) {
        continue;
      }
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

export function getRouteTitle(route: RouteRecordRaw, t: (key: string) => string) {
  const title = route.meta?.title as string | undefined;
  if (title) {
    return title;
  }
  const localeKey = route.meta?.locale as string | undefined;
  return localeKey ? t(localeKey) : String(route.name || '');
}
