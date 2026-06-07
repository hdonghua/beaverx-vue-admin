import type { Router, RouteRecordRaw } from 'vue-router';

export const EXTERNAL_ROUTE_FALLBACK_PARENT = 'linkHost';

export const EXTERNAL_PATH_PATTERN = /\/external\/(\d+)/;

const IFRAME_PAGE = () => import('@/views/iframe/index.vue');

export function isExternalLocationPath(path: string) {
  return EXTERNAL_PATH_PATTERN.test(path);
}

export function parseExternalRouteName(path: string) {
  const match = path.match(EXTERNAL_PATH_PATTERN);
  if (!match) {
    return null;
  }
  return `external-${match[1]}`;
}

function collectExternalMenuRoutes(
  routes: RouteRecordRaw[],
  result: RouteRecordRaw[] = []
) {
  routes.forEach((route) => {
    if (route.meta?.isExternal && route.name) {
      result.push(route);
    }
    if (route.children?.length) {
      collectExternalMenuRoutes(route.children, result);
    }
  });
  return result;
}

export function ensureExternalRoute(
  router: Router,
  route: RouteRecordRaw
): boolean {
  const routeName = route.name ? String(route.name) : '';
  if (!routeName || !route.meta?.isExternal) {
    return false;
  }

  const parentName = String(
    route.meta.externalParentName || EXTERNAL_ROUTE_FALLBACK_PARENT
  );

  if (!router.hasRoute(parentName)) {
    return false;
  }

  if (router.hasRoute(routeName)) {
    router.removeRoute(routeName);
  }

  router.addRoute(parentName, {
    path: route.path,
    name: route.name,
    component: IFRAME_PAGE,
    meta: { ...route.meta },
  });

  return true;
}

export function registerExternalRoutes(
  router: Router,
  routes: RouteRecordRaw[]
): string[] {
  const registeredNames: string[] = [];

  routes.forEach((route) => {
    const routeName = String(route.name);
    try {
      if (ensureExternalRoute(router, route)) {
        registeredNames.push(routeName);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to register external route: ${routeName}`, error);
    }
  });

  return registeredNames;
}

export function registerServerRoutes(
  router: Router,
  menus: RouteRecordRaw[]
): string[] {
  return registerExternalRoutes(router, collectExternalMenuRoutes(menus));
}

export function findMenuRouteByName(
  routes: RouteRecordRaw[],
  routeName: string
): RouteRecordRaw | undefined {
  for (const route of routes) {
    if (String(route.name) === routeName) {
      return route;
    }
    if (route.children?.length) {
      const matched = findMenuRouteByName(route.children, routeName);
      if (matched) {
        return matched;
      }
    }
  }
  return undefined;
}

export function ensureExternalRouteByName(
  router: Router,
  menus: RouteRecordRaw[],
  routeName: string
): boolean {
  const menuRoute = findMenuRouteByName(menus, routeName);
  if (!menuRoute?.meta?.isExternal) {
    return false;
  }
  return ensureExternalRoute(router, menuRoute);
}

export function unregisterServerRoutes(router: Router, routeNames: string[]) {
  routeNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}
