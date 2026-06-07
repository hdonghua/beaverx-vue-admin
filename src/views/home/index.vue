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
          {{ $t('home.welcome.subtitle') }}
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
  import { useI18n } from 'vue-i18n';
  import { useAppStore } from '@/store';

  const { t } = useI18n();
  const appStore = useAppStore();

  const welcomeTitle = computed(() =>
    t('home.welcome.title', { name: appStore.systemName })
  );
</script>

<style scoped lang="less">
  .home-page {
    padding: 20px;
  }

  .welcome-card {
    min-height: calc(100vh - 180px);
    border-radius: 8px;
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 420px;
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
