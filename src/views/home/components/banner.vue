<template>
  <a-col class="banner">
    <a-col :span="24">
      <a-typography-title :heading="5" style="margin-top: 0">
        欢迎回来，{{ userName }}
      </a-typography-title>
      <a-typography-paragraph class="subtitle">
        {{ systemName }} 工作台 · {{ todayText }}
      </a-typography-paragraph>
    </a-col>
    <a-divider class="panel-border" />
  </a-col>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import dayjs from 'dayjs';
  import { useAppStore, useUserStore } from '@/store';

  const userStore = useUserStore();
  const appStore = useAppStore();

  const userName = computed(() => userStore.name || '用户');
  const systemName = computed(() => appStore.systemName || 'BeaverX');
  const todayText = computed(() => dayjs().format('YYYY年MM月DD日'));
</script>

<style scoped lang="less">
  .banner {
    width: 100%;
    padding: 20px 20px 0 20px;
    background-color: var(--color-bg-2);
    border-radius: 4px 4px 0 0;
  }

  .subtitle {
    margin: 4px 0 0;
    color: var(--color-text-3);
    font-size: 13px;
  }
</style>
