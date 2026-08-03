import type { RouteRecordRaw } from 'vue-router';
import { DEFAULT_LAYOUT } from '@/router/routes/base';
import { MenuDto, MenuType } from '@/api/server/rbac/menu';
import { EXTERNAL_ROUTE_FALLBACK_PARENT } from '@/utils/register-server-routes';
import {
  hasViewComponent,
  resolveViewLoader,
} from '@/utils/view-loader';
import { collectStaticMenuRouteNames } from '@/router/static-menus';

export function menuRouteName(menuId: string | number) {
  return `menu-${menuId}`;
}

export function dirRouteName(menuId: string | number) {
  return `dir-${menuId}`;
}

function normalizeAbsolutePath(path?: string | null): string {
  if (!path?.trim()) {
    return '';
  }
  const value = path.trim().replace(/\\/g, '/');
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/** 将菜单完整 path 转为 vue-router 子路由 path */
function toChildRoutePath(menuFullPath: string, parentFullPath?: string): string {
  const full = normalizeAbsolutePath(menuFullPath);
  if (!full) {
    return '';
  }
  if (!parentFullPath) {
    return full;
  }
  const parent = normalizeAbsolutePath(parentFullPath);
  if (full === parent) {
    return '';
  }
  if (full.startsWith(`${parent}/`)) {
    return full.slice(parent.length + 1);
  }
  return full;
}

function formatMenuIcon(icon?: string | null) {
  if (!icon) {
    return undefined;
  }
  return icon.startsWith('icon-') ? icon : `icon-${icon}`;
}

function buildMenuMeta(menu: MenuDto): RouteRecordRaw['meta'] {
  const icon = formatMenuIcon(menu.icon);
  return {
    requiresAuth: true,
    roles: ['*'],
    title: menu.name,
    order: menu.sort,
    menuId: menu.id,
    ...(icon ? { icon } : {}),
  } as RouteRecordRaw['meta'];
}

function isSidebarMenu(menu: MenuDto) {
  return (
    menu.isEnabled &&
    menu.isVisible &&
    menu.menuType !== MenuType.Button
  );
}

function isAccessibleMenu(menu: MenuDto) {
  return menu.isEnabled && menu.menuType !== MenuType.Button;
}

function toExternalRoute(
  menu: MenuDto,
  parentDirRouteName?: string
): RouteRecordRaw {
  return {
    path: `external/${menu.id}`,
    name: `external-${menu.id}`,
    component: () => import('@/views/iframe/index.vue'),
    meta: {
      requiresAuth: true,
      title: menu.name,
      icon: formatMenuIcon(menu.icon),
      isExternal: true,
      frameSrc: menu.path || '',
      externalParentName: parentDirRouteName || EXTERNAL_ROUTE_FALLBACK_PARENT,
      order: menu.sort,
      roles: ['*'],
      ignoreCache: true,
      menuId: menu.id,
    },
  };
}

function toDirectoryRoute(
  menu: MenuDto,
  children: RouteRecordRaw[]
): RouteRecordRaw {
  const route: RouteRecordRaw = {
    path: normalizeAbsolutePath(menu.path) || `dir-${menu.id}`,
    name: dirRouteName(menu.id),
    component: DEFAULT_LAYOUT,
    meta: buildMenuMeta(menu),
    children,
  };

  const firstPage = children.find(
    (child) => child.name && !child.meta?.isExternal
  );
  if (firstPage?.name) {
    route.redirect = { name: String(firstPage.name) };
  }

  return route;
}

function toPageRoute(
  menu: MenuDto,
  parentFullPath?: string
): RouteRecordRaw | null {
  const loader = resolveViewLoader(menu.component);
  if (!loader || !menu.path) {
    return null;
  }

  return {
    path: toChildRoutePath(menu.path, parentFullPath),
    name: menuRouteName(menu.id),
    component: loader,
    meta: {
      ...buildMenuMeta(menu),
      ignoreCache: !menu.isCache,
    },
  } as RouteRecordRaw;
}

function buildMenuRoutesFromServer(
  serverChildren: MenuDto[],
  parentFullPath?: string,
  parentDirRouteName?: string,
  includeHidden = false
): RouteRecordRaw[] {
  const filterMenu = includeHidden ? isAccessibleMenu : isSidebarMenu;

  return serverChildren
    .filter(filterMenu)
    .sort((a, b) => a.sort - b.sort)
    .map((menu) => {
      if (menu.menuType === MenuType.Menu) {
        if (menu.isExternal) {
          return toExternalRoute(menu, parentDirRouteName);
        }
        return toPageRoute(menu, parentFullPath);
      }

      if (menu.menuType === MenuType.Directory) {
        const dirPath = normalizeAbsolutePath(menu.path);
        const children = buildMenuRoutesFromServer(
          menu.children || [],
          dirPath || parentFullPath,
          dirRouteName(menu.id),
          includeHidden
        );
        if (!children.length) {
          return null;
        }
        return toDirectoryRoute(menu, children);
      }

      return null;
    })
    .filter((route): route is RouteRecordRaw => !!route);
}

function buildServerRouteTree(
  menus: MenuDto[],
  includeHidden: boolean
): RouteRecordRaw[] {
  const filterMenu = includeHidden ? isAccessibleMenu : isSidebarMenu;

  return menus
    .filter((menu) => menu.menuType === MenuType.Directory && filterMenu(menu))
    .sort((a, b) => a.sort - b.sort)
    .map((menu) => {
      const dirPath = normalizeAbsolutePath(menu.path);
      const children = buildMenuRoutesFromServer(
        menu.children || [],
        dirPath,
        dirRouteName(menu.id),
        includeHidden
      );
      if (!children.length) {
        return null;
      }
      return toDirectoryRoute(menu, children);
    })
    .filter((route): route is RouteRecordRaw => !!route);
}

/** 按后端菜单构建路由树（含隐藏菜单，用于动态注册） */
export function collectInternalRoutesFromMenus(menus: MenuDto[]): RouteRecordRaw[] {
  return buildServerRouteTree(menus, true);
}

/** 将后端菜单转为侧边栏结构（path / name 均来自后端菜单） */
export function transformServerMenus(menus: MenuDto[]): RouteRecordRaw[] {
  return buildServerRouteTree(menus, false);
}

/** 收集外链路由（含隐藏菜单） */
export function collectExternalRoutesFromMenus(menus: MenuDto[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];

  const walk = (items: MenuDto[], parentDirRouteName?: string) => {
    items
      .filter((menu) => menu.isEnabled)
      .sort((a, b) => a.sort - b.sort)
      .forEach((menu) => {
        if (menu.menuType === MenuType.Menu && menu.isExternal) {
          result.push(toExternalRoute(menu, parentDirRouteName));
          return;
        }

        if (menu.menuType === MenuType.Directory && menu.children?.length) {
          walk(menu.children, dirRouteName(menu.id));
        }
      });
  };

  walk(menus);
  return result;
}

function buildMenuIndex(menus: MenuDto[]) {
  const menuById = new Map<string, MenuDto>();
  const walk = (items: MenuDto[]) => {
    items.forEach((menu) => {
      menuById.set(String(menu.id), menu);
      if (menu.children?.length) {
        walk(menu.children);
      }
    });
  };
  walk(menus);
  return menuById;
}

function collectDirectoryAncestors(
  menu: MenuDto,
  menuById: Map<string, MenuDto>
): string[] {
  const names: string[] = [];
  let parentId = menu.parentId;
  while (parentId) {
    const parent = menuById.get(String(parentId));
    if (!parent) {
      break;
    }
    if (parent.menuType === MenuType.Directory) {
      names.push(dirRouteName(parent.id));
    }
    parentId = parent.parentId;
  }
  return names;
}

/** 收集可访问路由 name（menu-{id} / dir-{id} / external-{id}） */
export function collectAllowedRouteNames(menus: MenuDto[]): Set<string> {
  const names = new Set<string>();
  const menuById = buildMenuIndex(menus);

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
      } else if (menu.menuType === MenuType.Menu) {
        if (hasViewComponent(menu.component)) {
          names.add(menuRouteName(menu.id));
          collectDirectoryAncestors(menu, menuById).forEach((name) =>
            names.add(name)
          );
        }
      } else if (menu.menuType === MenuType.Directory) {
        names.add(dirRouteName(menu.id));
      }

      if (menu.children?.length) {
        walk(menu.children);
      }
    });
  };

  walk(menus);
  return names;
}

export function collectAllAllowedRouteNames(menus: MenuDto[]): string[] {
  return [
    ...collectAllowedRouteNames(menus || []),
    ...collectStaticMenuRouteNames(),
  ];
}

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

export function getFirstAccessibleRouteName(
  menus: RouteRecordRaw[]
): string | null {
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

export function getRouteTitle(route: RouteRecordRaw) {
  const title = route.meta?.title as string | undefined;
  return title || String(route.name || '');
}
