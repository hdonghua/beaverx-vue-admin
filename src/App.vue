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
  import { computed, watchEffect } from 'vue';
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import AppUpdateModal from '@/components/app-update-modal/index.vue';
  import useLocale from '@/hooks/locale';
  import useAppUpdate from '@/hooks/use-app-update';
  import { useAppStore } from '@/store';

  const appStore = useAppStore();
  const { currentLocale } = useLocale();
  const { visible: updateVisible, snooze: snoozeUpdate, refresh: refreshApp } =
    useAppUpdate();

  watchEffect(() => {
    document.title = appStore.systemName;
  });
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return enUS;
    }
  });
</script>
