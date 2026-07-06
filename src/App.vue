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
  import { watchEffect } from 'vue';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import AppUpdateModal from '@/components/app-update-modal/index.vue';
  import useAppUpdate from '@/hooks/use-app-update';
  import { useAppStore } from '@/store';

  const appStore = useAppStore();
  const { visible: updateVisible, snooze: snoozeUpdate, refresh: refreshApp } =
    useAppUpdate();
  const locale = zhCN;

  watchEffect(() => {
    document.title = appStore.systemName;
  });
</script>
