import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store';
import {
  hasPermission as checkPermission,
  type PermissionCheckMode,
} from '@/utils/permission-check';

export default function usePermission() {
  const userStore = useUserStore();

  return {
    /** 路由是否可访问（基于 meta.roles，与权限码无关） */
    accessRouter(route: RouteLocationNormalized | RouteRecordRaw) {
      return (
        !route.meta?.requiresAuth ||
        !route.meta?.roles ||
        route.meta?.roles?.includes('*') ||
        route.meta?.roles?.includes(userStore.role)
      );
    },

    findFirstPermissionRoute(_routers: any, role = 'admin') {
      const cloneRouters = [..._routers];
      while (cloneRouters.length) {
        const firstElement = cloneRouters.shift();
        if (
          firstElement?.meta?.roles?.find((el: string[]) => {
            return el.includes('*') || el.includes(role);
          })
        )
          return { name: firstElement.name };
        if (firstElement?.children) {
          cloneRouters.push(...firstElement.children);
        }
      }
      return null;
    },

    /**
     * 是否拥有指定权限码（默认满足任一）。
     * 适合 v-if、逻辑分支等指令不便使用的场景。
     */
    hasPermission(
      value: string | string[],
      mode: PermissionCheckMode = 'any'
    ) {
      return checkPermission(value, mode);
    },

    /** 是否拥有全部指定权限码 */
    hasAllPermissions(value: string | string[]) {
      return checkPermission(value, 'all');
    },
  };
}
