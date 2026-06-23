import type { Router, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore } from '@/store';
import { flattenRouteNames } from '@/utils/server-menu';
import {
  isExternalLocationPath,
  parseExternalRouteName,
} from '@/utils/register-server-routes';
import { appRoutes } from '../routes';
import {
  ROUTE_ACCESS_WHITE_LIST,
  NOT_FOUND,
  FORBIDDEN,
  MENU_FETCH_SKIP_ROUTES,
} from '../constants';

const appRouteNames = flattenRouteNames(appRoutes as RouteRecordRaw[]);

function isRegisteredRoute(router: Router, name: unknown) {
  if (!name) {
    return false;
  }
  return router.getRoutes().some((route) => route.name === name);
}

function isRouteDefinedInApp(router: Router, routeName: string) {
  return (
    appRouteNames.includes(routeName) ||
    isRegisteredRoute(router, routeName)
  );
}

function shouldFetchServerMenu(
  appStore: ReturnType<typeof useAppStore>,
  routeName: string,
  path: string
) {
  if (!appStore.appAsyncMenus.length) {
    return true;
  }
  if (isExternalLocationPath(path)) {
    return true;
  }
  if (
    !routeName &&
    path &&
    path !== '/' &&
    !path.startsWith('/login')
  ) {
    return true;
  }
  return !MENU_FETCH_SKIP_ROUTES.includes(routeName);
}

function shouldRetryNavigation(
  router: Router,
  to: { fullPath: string; name?: string | symbol | null }
) {
  if (to.name === NOT_FOUND.name || to.name === 'notFound') {
    const resolved = router.resolve(to.fullPath);
    return (
      !!resolved.name &&
      resolved.name !== NOT_FOUND.name &&
      resolved.name !== 'notFound'
    );
  }
  return !to.name || !router.hasRoute(to.name);
}

function tryResolveExternalRefresh(
  router: Router,
  to: {
    name?: string | symbol | null;
    path: string;
    query: import('vue-router').LocationQuery;
  },
  next: (value?: unknown) => void
) {
  if (!isExternalLocationPath(to.path)) {
    return false;
  }

  const externalRouteName = parseExternalRouteName(to.path);
  if (!externalRouteName || !router.hasRoute(externalRouteName)) {
    return false;
  }

  if (to.name !== externalRouteName) {
    next({
      name: externalRouteName,
      query: to.query,
      replace: true,
    });
    return true;
  }

  return false;
}

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    try {
      const appStore = useAppStore();
      const userStore = useUserStore();
      const Permission = usePermission();
      const permissionsAllow = Permission.accessRouter(to);
      const routeName = to.name ? String(to.name) : '';

      if (appStore.menuFromServer) {
        if (shouldFetchServerMenu(appStore, routeName, to.path)) {
          await appStore.fetchServerMenuConfig(router);

          if (shouldRetryNavigation(router, to)) {
            next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true });
            return;
          }
        }

        if (tryResolveExternalRefresh(router, to, next)) {
          return;
        }

        const resolvedName = to.name
          ? String(to.name)
          : String(router.resolve(to.fullPath).name || '');
        const isWhiteListed = ROUTE_ACCESS_WHITE_LIST.includes(resolvedName);
        const hasMenuAccess =
          isWhiteListed || appStore.allowedRouteNames.includes(resolvedName);

        if (!permissionsAllow) {
          next(hasMenuAccess ? FORBIDDEN : NOT_FOUND);
          return;
        }

        if (hasMenuAccess) {
          next();
        } else if (isRouteDefinedInApp(router, resolvedName)) {
          next(FORBIDDEN);
        } else {
          next(NOT_FOUND);
        }
      } else if (permissionsAllow) {
        next();
      } else {
        const destination =
          Permission.findFirstPermissionRoute(appRoutes, userStore.role) ||
          FORBIDDEN;
        next(destination);
      }
    } finally {
      NProgress.done();
    }
  });
}
