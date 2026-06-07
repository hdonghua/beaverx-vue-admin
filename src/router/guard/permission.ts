import type { Router, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore } from '@/store';
import { flattenRouteNames } from '@/utils/server-menu';
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

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore();
    const userStore = useUserStore();
    const Permission = usePermission();
    const permissionsAllow = Permission.accessRouter(to);
    const routeName = String(to.name);

    if (appStore.menuFromServer) {
      if (
        !appStore.appAsyncMenus.length &&
        !MENU_FETCH_SKIP_ROUTES.includes(routeName)
      ) {
        await appStore.fetchServerMenuConfig();
      }

      const isWhiteListed = ROUTE_ACCESS_WHITE_LIST.includes(routeName);
      const allowedMenuRoutes = flattenRouteNames(
        appStore.appAsyncMenus as RouteRecordRaw[]
      );
      const hasMenuAccess =
        isWhiteListed || allowedMenuRoutes.includes(routeName);

      if (!permissionsAllow) {
        next(hasMenuAccess ? FORBIDDEN : NOT_FOUND);
        return;
      }

      if (hasMenuAccess) {
        next();
      } else if (isRouteDefinedInApp(router, routeName)) {
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
    NProgress.done();
  });
}
