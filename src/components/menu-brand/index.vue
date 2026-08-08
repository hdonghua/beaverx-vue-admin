<template>
  <div
    class="menu-brand"
    :class="{
      'menu-brand-dark': dark,
      'menu-brand-collapsed': collapsed,
    }"
  >
    <img alt="logo" class="menu-brand-logo" :src="Logo" />
    <span v-if="!collapsed" class="menu-brand-text">{{
      appStore.systemName
    }}</span>
  </div>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store';
  import Logo from '@/assets/images/beaverx-admin-logo.png';

  defineProps<{
    dark?: boolean;
    collapsed?: boolean;
  }>();

  const appStore = useAppStore();
</script>

<style scoped lang="less">
  .menu-brand {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    height: 60px;
    padding: 0 16px;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--color-bg-2);
  }

  .menu-brand-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .menu-brand-text {
    margin-left: 10px;
    color: var(--color-text-1);
    font-size: 18px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  .menu-brand-collapsed {
    justify-content: center;
    padding: 0;
  }

  .menu-brand-dark {
    background: var(--color-menu-dark-bg);

    .menu-brand-text {
      color: var(--color-fill-1);
    }
  }
</style>
