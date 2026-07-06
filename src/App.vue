<template>
  <a-config-provider :locale="locale">
    <router-view />
    <global-setting />
    <app-update-modal
      :visible="updateVisible"
      @snooze="snoozeUpdate"
      @refresh="refreshApp"
    />
  </a-config-provider>
</template>

<script lang="ts" setup>
  import { onMounted, watchEffect } from 'vue';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import AppUpdateModal from '@/components/app-update-modal/index.vue';
  import useAppUpdate from '@/hooks/use-app-update';
  import { useAppStore } from '@/store';
  import { applyUserPreferences } from '@/utils/apply-user-preferences';

  const appStore = useAppStore();
  const { visible: updateVisible, snooze: snoozeUpdate, refresh: refreshApp } =
    useAppUpdate();
  const locale = zhCN;

  onMounted(() => {
    applyUserPreferences(appStore);
    appStore.toggleTheme(appStore.theme === 'dark');
  });

  watchEffect(() => {
    document.title = appStore.systemName;
  });
</script>
