import { DirectiveBinding } from 'vue';
import { hasPermission, normalizePermissionCodes } from '@/utils/permission-check';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const permissionValues = normalizePermissionCodes(binding.value);

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
