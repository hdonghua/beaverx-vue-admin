import type { Router } from 'vue-router';
import NProgress from 'nprogress';
import { setRouteEmitter } from '@/utils/route-listener';
import { isDynamicImportError } from '@/utils/route-chunk-error';
import { useAppStore } from '@/store';
import setupUserLoginInfoGuard from './userLoginInfo';
import setupPermissionGuard from './permission';

function setupPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    // emit route change
    setRouteEmitter(to);
  });
}

function setupProgressGuard(router: Router) {
  router.afterEach(() => {
    NProgress.done();
  });
}

function setupChunkErrorGuard(router: Router) {
  router.onError(async (error) => {
    if (!isDynamicImportError(error)) {
      return;
    }
    const appStore = useAppStore();
    if (!appStore.menuFromServer) {
      window.location.reload();
      return;
    }
    await appStore.fetchServerMenuConfig(router);
    const { fullPath } = router.currentRoute.value;
    if (fullPath && fullPath !== '/') {
      await router.replace(fullPath);
    }
  });
}

export default function createRouteGuard(router: Router) {
  setupPageGuard(router);
  setupUserLoginInfoGuard(router);
  setupPermissionGuard(router);
  setupProgressGuard(router);
  setupChunkErrorGuard(router);
}
