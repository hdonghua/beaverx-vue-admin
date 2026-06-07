import type { Router, RouteRecordNormalized, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore } from '@/store';
import { flattenRouteNames } from '@/utils/server-menu';
import { appRoutes } from '../routes';
import { WHITE_LIST, NOT_FOUND, MENU_FETCH_SKIP_ROUTES } from '../constants';

const appRouteNames = flattenRouteNames(appRoutes as RouteRecordRaw[]);

function isRegisteredRoute(router: Router, name: unknown) {
  if (!name) {
    return false;
  }
  return router.getRoutes().some((route) => route.name === name);
}

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore();
    const userStore = useUserStore();
    const Permission = usePermission();
    const permissionsAllow = Permission.accessRouter(to);

    if (appStore.menuFromServer) {
      if (
        !appStore.appAsyncMenus.length &&
        !MENU_FETCH_SKIP_ROUTES.includes(String(to.name))
      ) {
        await appStore.fetchServerMenuConfig();
      }

      const serverMenuConfig = [
        ...(appStore.appAsyncMenus as RouteRecordRaw[]),
        ...WHITE_LIST,
      ];

      let existInServerMenu = false;
      while (serverMenuConfig.length && !existInServerMenu) {
        const element = serverMenuConfig.shift();
        if (element?.name === to.name) {
          existInServerMenu = true;
        }
        if (element?.children) {
          serverMenuConfig.push(
            ...(element.children as unknown as RouteRecordNormalized[])
          );
        }
      }

      const existInApp =
        appRouteNames.includes(String(to.name)) ||
        isRegisteredRoute(router, to.name);

      if ((existInServerMenu || existInApp) && permissionsAllow) {
        next();
      } else {
        next(NOT_FOUND);
      }
    } else if (permissionsAllow) {
      next();
    } else {
      const destination =
        Permission.findFirstPermissionRoute(appRoutes, userStore.role) ||
        NOT_FOUND;
      next(destination);
    }
    NProgress.done();
  });
}
