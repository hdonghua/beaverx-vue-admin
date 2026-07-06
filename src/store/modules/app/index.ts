import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import type { Router, RouteRecordRaw } from 'vue-router';
import {
  fixedSettings,
  userPreferenceDefaults,
  USER_PREFERENCE_KEYS,
} from '@/config';
import { getUserMenus } from '@/api/server/rbac/menu';
import {
  transformServerMenus,
  getFirstAccessibleRouteName,
  collectAllAllowedRouteNames,
  collectExternalRoutesFromMenus,
  collectInternalRoutesFromMenus,
} from '@/utils/server-menu';
import {
  registerExternalRoutes,
  registerInternalRoutes,
  unregisterServerRoutes,
  ensureNotFoundRouteLast,
} from '@/utils/register-server-routes';
import { applyUserPreferences } from '@/utils/apply-user-preferences';
import type { AppState, UserPreferences } from './types';
import useUserStore from '../user';

async function getRouter() {
  const { default: router } = await import('@/router');
  return router;
}

function createInitialState(): AppState {
  return {
    ...userPreferenceDefaults,
    ...fixedSettings,
    hideMenu: false,
    device: 'desktop',
    globalSettings: false,
    serverMenuFetched: false,
    menuOwnerId: null,
    serverMenu: [],
    allowedRouteNames: [],
    registeredServerRouteNames: [],
  };
}

const useAppStore = defineStore('app', {
  state: (): AppState => createInitialState(),

  persist: {
    key: 'app-user-preferences',
    paths: [...USER_PREFERENCE_KEYS],
    afterRestore({ store }) {
      const appStore = store as ReturnType<typeof useAppStore>;
      applyUserPreferences(appStore);
      appStore.toggleTheme(appStore.theme === 'dark');
    },
  },

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): RouteRecordRaw[] {
      return state.serverMenu;
    },
  },

  actions: {
    updateSettings(partial: Partial<AppState>) {
      // @ts-expect-error dynamic route records in partial patch
      this.$patch(partial);
      if (USER_PREFERENCE_KEYS.some((key) => key in partial)) {
        applyUserPreferences(this);
      }
    },

    updateUserPreference(partial: Partial<UserPreferences>) {
      if (partial.topMenu) {
        this.menuCollapse = false;
      }
      Object.assign(this, partial);
      applyUserPreferences(this);
    },

    resetUserPreferences() {
      this.$patch({ ...userPreferenceDefaults });
      applyUserPreferences(this);
      this.toggleTheme(this.theme === 'dark');
    },

    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
      applyUserPreferences(this);
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig(routerInstance?: Router) {
      let notifyInstance: NotificationReturn | null = null;
      const userStore = useUserStore();
      try {
        const { data } = await getUserMenus();
        this.serverMenu = transformServerMenus(data);
        this.allowedRouteNames = collectAllAllowedRouteNames(data || []);
        this.menuOwnerId = userStore.accountId ?? null;

        try {
          const router = routerInstance ?? (await getRouter());
          unregisterServerRoutes(
            router,
            this.registeredServerRouteNames ?? []
          );
          const internalRoutes = collectInternalRoutesFromMenus(data || []);
          const externalRoutes = collectExternalRoutesFromMenus(data || []);
          this.registeredServerRouteNames = [
            ...registerInternalRoutes(router, internalRoutes),
            ...registerExternalRoutes(router, externalRoutes),
          ];
          ensureNotFoundRouteLast(router);
        } catch (routeError) {
          // eslint-disable-next-line no-console
          console.warn('服务端路由注册失败，侧边栏菜单不受影响', routeError);
          this.registeredServerRouteNames = [];
        }

        return data;
      } catch (error) {
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: '菜单加载失败',
          closable: true,
        });
        this.serverMenu = [];
        this.allowedRouteNames = collectAllAllowedRouteNames([]);
        this.registeredServerRouteNames = [];
        this.menuOwnerId = null;
        return [];
      } finally {
        this.serverMenuFetched = true;
      }
    },
    getDefaultRouteName() {
      if (!this.serverMenu.length) {
        return null;
      }
      return getFirstAccessibleRouteName(this.serverMenu);
    },
    async clearServerMenu() {
      try {
        const router = await getRouter();
        unregisterServerRoutes(
          router,
          this.registeredServerRouteNames ?? []
        );
      } catch {
        // ignore cleanup errors during logout
      }
      this.registeredServerRouteNames = [];
      this.serverMenu = [];
      this.allowedRouteNames = [];
      this.serverMenuFetched = false;
      this.menuOwnerId = null;
    },
  },
});

export default useAppStore;
