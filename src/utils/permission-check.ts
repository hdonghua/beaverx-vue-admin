import { useUserStore } from '@/store';
import { SuperAdmin } from '@/constants/permissions';

export type PermissionCheckMode = 'any' | 'all';

export function normalizePermissionCodes(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }

  return [];
}

export function checkPermissionCodes(
  codes: string[],
  mode: PermissionCheckMode = 'any'
): boolean {
  if (codes.length === 0) {
    return false;
  }

  const userStore = useUserStore();

  if (userStore.role === '*') {
    return true;
  }

  const userPermissions = userStore.permissions || [];
  if (userPermissions.includes(SuperAdmin)) {
    return true;
  }

  if (mode === 'all') {
    return codes.every((code) => userPermissions.includes(code));
  }

  return codes.some((code) => userPermissions.includes(code));
}

/** 校验是否拥有指定权限（默认满足任一） */
export function hasPermission(
  value: string | string[],
  mode: PermissionCheckMode = 'any'
): boolean {
  return checkPermissionCodes(normalizePermissionCodes(value), mode);
}
