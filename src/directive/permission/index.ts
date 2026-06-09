import { DirectiveBinding } from 'vue';
import { useUserStore } from '@/store';
import { SuperAdmin } from '@/constants/permissions';

function normalizePermissionValues(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }

  return [];
}

function hasPermission(permissionValues: string[]) {
  const userStore = useUserStore();

  if (userStore.role === '*') {
    return true;
  }

  const userPermissions = userStore.permissions || [];
  if (userPermissions.includes(SuperAdmin)) {
    return true;
  }

  return permissionValues.some((code) => userPermissions.includes(code));
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const permissionValues = normalizePermissionValues(binding.value);

  if (permissionValues.length === 0) {
    throw new Error(
      'v-permission value is required. Example: v-permission="[\'system:user:reset_password\']"'
    );
  }

  if (!hasPermission(permissionValues) && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
