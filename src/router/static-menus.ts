import type { RouteRecordRaw } from 'vue-router';
import appClientMenus from '@/router/app-menus';

/** 仅前端静态展示的菜单（不依赖后端菜单种子） */
export function getStaticMenuRoutes(): RouteRecordRaw[] {
  return (appClientMenus as RouteRecordRaw[]).filter(
    (route) => route.meta?.staticMenu === true
  );
}

export function collectStaticMenuRouteNames(): string[] {
  const names: string[] = [];
  const walk = (routes: RouteRecordRaw[]) => {
    routes.forEach((route) => {
      if (route.name) {
        names.push(String(route.name));
      }
      if (route.children?.length) {
        walk(route.children);
      }
    });
  };
  walk(getStaticMenuRoutes());
  return names;
}
