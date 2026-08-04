<template>
  <div class="home-page">
    <a-card class="welcome-card" :bordered="false">
      <div class="welcome-content">
        <div class="welcome-icon">
          <icon-apps />
        </div>
        <a-typography-title :heading="3" class="welcome-title">
          {{ welcomeTitle }}
        </a-typography-title>
        <a-typography-paragraph class="welcome-subtitle">
          请从左侧菜单进入功能模块，或使用顶部搜索快速跳转
        </a-typography-paragraph>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'HomePage',
  };
</script>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useAppStore } from '@/store';

    const appStore = useAppStore();

  const welcomeTitle = computed(
    () => `欢迎使用${appStore.systemName}`
  );
</script>

<style scoped lang="less">
  .home-page {
    height: 100%;
    box-sizing: border-box;
    padding: 16px;
  }

  .welcome-card {
    height: 100%;
    border-radius: 8px;

    :deep(.arco-card-body) {
      height: 100%;
      box-sizing: border-box;
    }
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .welcome-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin-bottom: 24px;
    color: rgb(var(--primary-6));
    font-size: 36px;
    background: rgb(var(--primary-1));
    border-radius: 20px;
  }

  .welcome-title {
    margin: 0 0 12px;
    color: var(--color-text-1);
  }

  .welcome-subtitle {
    max-width: 520px;
    margin: 0;
    font-size: 15px;
    color: var(--color-text-3);
  }
</style>
