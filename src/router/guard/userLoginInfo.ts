import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import { isLogin } from '@/utils/auth';
import { shouldForceLogout } from '@/utils/session';
import { clearSessionAndNotify } from '@/utils/session-expired';
import { DEFAULT_ROUTE_NAME } from '../constants';

function redirectToLogin(
  to: { fullPath: string; query: Record<string, unknown> },
  next: (value?: unknown) => void
) {
  next({
    name: 'login',
    query: {
      redirect: to.fullPath,
      ...to.query,
    } as LocationQueryRaw,
  });
}

export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const userStore = useUserStore();

    if (to.name === 'login') {
      if (isLogin() && !shouldForceLogout()) {
        // 应用内跳转：取消导航，留在当前页
        if (from.matched.length > 0 && from.path !== to.path) {
          NProgress.done();
          next(false);
          return;
        }

        // 地址栏直接打开 /login：已登录则去首页（或 redirect 目标）
        const redirect = to.query.redirect;
        if (
          typeof redirect === 'string' &&
          redirect.startsWith('/') &&
          redirect !== '/login'
        ) {
          next({ path: redirect, replace: true });
          return;
        }
        next({ name: DEFAULT_ROUTE_NAME, replace: true });
        return;
      }
      next();
      return;
    }

    if (!isLogin() || shouldForceLogout()) {
      if (userStore.role) {
        userStore.logoutCallBack();
      }
      redirectToLogin(to, next);
      return;
    }

    if (userStore.role) {
      next();
      return;
    }

    try {
      await userStore.info();
      next();
    } catch {
      await clearSessionAndNotify('登录已过期，请重新登录');
      redirectToLogin(to, next);
    }
  });
}
