import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import { isLogin } from '@/utils/auth';
import { shouldForceLogout } from '@/utils/session';

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
      next();
      return;
    }

    if (!isLogin() || shouldForceLogout()) {
      if (userStore.role) {
        await userStore.logoutCallBack();
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
      await userStore.logout();
      redirectToLogin(to, next);
    }
  });
}
