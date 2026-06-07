import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import type { RouteRecordRaw } from 'vue-router';
import defaultSettings from '@/config/settings.json';
import { getUserMenus } from '@/api/server/menu';
import {
  transformServerMenus,
  getFirstAccessibleRouteName,
} from '@/utils/server-menu';
import { AppState } from './types';

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
    async fetchServerMenuConfig() {
      let notifyInstance: NotificationReturn | null = null;
      try {
        const { data } = await getUserMenus();
        this.serverMenu = transformServerMenus(data);
        return data;
      } catch (error) {
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: '菜单加载失败',
          closable: true,
        });
        this.serverMenu = [];
        return [];
      }
    },
    getDefaultRouteName() {
      if (!this.serverMenu.length) {
        return null;
      }
      return getFirstAccessibleRouteName(this.serverMenu);
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
  },
});

export default useAppStore;
