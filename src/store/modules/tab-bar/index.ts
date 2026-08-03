import type { LocationQuery, RouteLocationNormalized } from 'vue-router';
import { defineStore } from 'pinia';
import {
  DEFAULT_ROUTE,
  DEFAULT_ROUTE_NAME,
  REDIRECT_ROUTE_NAME,
} from '@/router/constants';
import { isString } from '@/utils/is';
import {
  bumpRouteCacheVersion,
  clearRouteCacheVersions,
} from '@/utils/route-cache';
import { TabBarState, TagProps } from './types';

const formatTag = (route: RouteLocationNormalized): TagProps => {
  const { name, meta, fullPath, query } = route;
  const isExternal = Boolean(meta.isExternal);
  const frameSrc = String(meta.frameSrc || query?.frameSrc || '');
  return {
    title: String(meta.title || name || ''),
    name: String(name),
    fullPath,
    query: (isExternal && frameSrc
      ? { ...query, frameSrc }
      : query) as LocationQuery | undefined,
    isExternal,
    frameSrc: frameSrc || undefined,
    ignoreCache: meta.ignoreCache,
  };
};

const BAN_LIST = [REDIRECT_ROUTE_NAME];

const useTabBarStore = defineStore('tabBar', {
  state: (): TabBarState => ({
    cacheTabList: new Set([DEFAULT_ROUTE_NAME]),
    tagList: [DEFAULT_ROUTE],
  }),

  persist: {
    key: 'tab-bar',
    paths: ['tagList'],
    afterRestore({ store }) {
      const tabBarStore = store as ReturnType<typeof useTabBarStore>;
      tabBarStore.syncCacheFromTagList();
      tabBarStore.ensureHomeTab();
    },
  },

  getters: {
    getTabList(): TagProps[] {
      return this.tagList;
    },
    getCacheList(): string[] {
      return Array.from(this.cacheTabList);
    },
  },

  actions: {
    removeCacheByName(name?: string) {
      if (!isString(name) || name === '') {
        return;
      }

      this.cacheTabList.delete(name);
      bumpRouteCacheVersion(name);
    },
    updateTabList(route: RouteLocationNormalized) {
      if (BAN_LIST.includes(route.name as string)) return;
      const tag = formatTag(route);
      const existingIndex = this.tagList.findIndex(
        (item) =>
          item.fullPath === tag.fullPath ||
          (tag.isExternal && item.name === tag.name)
      );
      if (existingIndex === -1) {
        this.tagList.push(tag);
      } else {
        this.tagList[existingIndex] = {
          ...this.tagList[existingIndex],
          ...tag,
        };
      }
      this.ensureHomeTab();
      if (!route.meta.ignoreCache) {
        this.cacheTabList.add(route.name as string);
      } else {
        this.removeCacheByName(route.name as string);
      }
    },
    deleteTag(idx: number, tag: TagProps) {
      this.tagList.splice(idx, 1);
      this.removeCacheByName(tag.name);
    },
    addCache(name: string) {
      if (isString(name) && name !== '') this.cacheTabList.add(name);
    },
    deleteCache(tag: TagProps) {
      this.removeCacheByName(tag.name);
    },
    syncCacheFromTagList() {
      this.cacheTabList.clear();
      this.tagList
        .filter((el) => !el.ignoreCache)
        .forEach((el) => this.cacheTabList.add(el.name));
    },
    freshTabList(tags: TagProps[]) {
      const nextNames = new Set(tags.map((tag) => tag.name));
      const removedCacheNames = this.tagList
        .filter((tag) => !tag.ignoreCache && !nextNames.has(tag.name))
        .map((tag) => tag.name);
      clearRouteCacheVersions(removedCacheNames);
      this.tagList = tags;
      this.syncCacheFromTagList();
    },
    ensureHomeTab() {
      const homeIndex = this.tagList.findIndex(
        (tag) => tag.name === DEFAULT_ROUTE_NAME
      );
      if (homeIndex === -1) {
        this.tagList.unshift(DEFAULT_ROUTE);
        this.cacheTabList.add(DEFAULT_ROUTE_NAME);
        return;
      }
      if (homeIndex > 0) {
        const [homeTab] = this.tagList.splice(homeIndex, 1);
        this.tagList.unshift(homeTab);
      }
    },
    resetTabList() {
      const removedCacheNames = this.tagList
        .filter((tag) => !tag.ignoreCache && tag.name !== DEFAULT_ROUTE_NAME)
        .map((tag) => tag.name);
      clearRouteCacheVersions(removedCacheNames);
      this.tagList = [DEFAULT_ROUTE];
      this.cacheTabList.clear();
      this.cacheTabList.add(DEFAULT_ROUTE_NAME);
    },
  },
});

export default useTabBarStore;
