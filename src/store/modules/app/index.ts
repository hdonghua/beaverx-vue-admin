import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import type { Router, RouteRecordRaw } from 'vue-router';
import defaultSettings from '@/config/settings.json';
import { getUserMenus } from '@/api/server/rbac/menu';
import {
  transformServerMenus,
  getFirstAccessibleRouteName,
  collectAllowedRouteNames,
  collectExternalRoutesFromMenus,
} from '@/utils/server-menu';
import {
  registerExternalRoutes,
  unregisterServerRoutes,
} from '@/utils/register-server-routes';
import { AppState } from './types';

async function getRouter() {
  const { default: router } = await import('@/router');
  return router;
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({ ...defaultSettings }),

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
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig(routerInstance?: Router) {
      let notifyInstance: NotificationReturn | null = null;
      try {
        const { data } = await getUserMenus();
        this.serverMenu = transformServerMenus(data);
        this.allowedRouteNames = [
          ...collectAllowedRouteNames(data || []),
        ];

        try {
          const router = routerInstance ?? (await getRouter());
          unregisterServerRoutes(
            router,
            this.registeredServerRouteNames ?? []
          );
          this.registeredServerRouteNames = registerExternalRoutes(
            router,
            collectExternalRoutesFromMenus(data || [])
          );
        } catch (routeError) {
          // eslint-disable-next-line no-console
          console.warn('外链路由注册失败，侧边栏菜单不受影响', routeError);
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
        this.allowedRouteNames = [];
        this.registeredServerRouteNames = [];
        return [];
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
    },
  },
});

export default useAppStore;
