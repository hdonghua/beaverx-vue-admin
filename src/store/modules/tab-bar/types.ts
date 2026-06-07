import type { LocationQuery } from 'vue-router';

export interface TagProps {
  title: string;
  name: string;
  fullPath: string;
  query?: LocationQuery;
  ignoreCache?: boolean;
  isExternal?: boolean;
  frameSrc?: string;
}

export interface TabBarState {
  tagList: TagProps[];
  cacheTabList: Set<string>;
}
