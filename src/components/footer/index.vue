<template>
  <a-layout-footer class="footer" v-html="appStore.footerText" />
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store';

  const appStore = useAppStore();
</script>

<style lang="less" scoped>
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    color: var(--color-text-2);
    text-align: center;

    :deep(a) {
      color: rgb(var(--link-6));
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
