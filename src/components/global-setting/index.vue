<template>
  <div
    v-if="!appStore.navbar && appStore.navbarSettings"
    class="fixed-settings"
    @click="setVisible"
  >
    <a-button type="primary">
      <template #icon>
        <icon-settings />
      </template>
    </a-button>
  </div>
  <a-drawer
    :width="300"
    unmount-on-close
    :visible="visible"
    :footer="false"
    @cancel="cancel"
  >
    <template #title>页面配置</template>
    <Block :options="themeOpts" title="主题" />
    <Block :options="layoutOpts" title="布局" />
    <div class="drawer-actions">
      <a-button long @click="handleReset">恢复默认</a-button>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useAppStore } from '@/store';
  import Block from './block.vue';

  const emit = defineEmits(['cancel']);

  const appStore = useAppStore();
  const visible = computed(() => appStore.globalSettings);

  const themeOpts = computed(() => [
    {
      name: '主题色',
      key: 'themeColor',
      defaultVal: appStore.themeColor,
      type: 'color',
    },
    {
      name: '色弱模式',
      key: 'colorWeak',
      defaultVal: appStore.colorWeak,
    },
  ]);

  const layoutOpts = computed(() => [
    { name: '导航栏', key: 'navbar', defaultVal: appStore.navbar },
    { name: '菜单栏', key: 'menu', defaultVal: appStore.menu },
    { name: '顶部菜单栏', key: 'topMenu', defaultVal: appStore.topMenu },
    { name: '底部', key: 'footer', defaultVal: appStore.footer },
    { name: '多页签', key: 'tabBar', defaultVal: appStore.tabBar },
    {
      name: '菜单宽度 (px)',
      key: 'menuWidth',
      defaultVal: appStore.menuWidth,
      type: 'number',
    },
    {
      name: '菜单收起',
      key: 'menuCollapse',
      defaultVal: appStore.menuCollapse,
    },
  ]);

  const cancel = () => {
    appStore.updateSettings({ globalSettings: false });
    emit('cancel');
  };

  const handleReset = () => {
    appStore.resetUserPreferences();
    Message.success('已恢复默认偏好设置');
  };

  const setVisible = () => {
    appStore.updateSettings({ globalSettings: true });
  };
</script>

<style scoped lang="less">
  .fixed-settings {
    position: fixed;
    top: 280px;
    right: 0;

    svg {
      font-size: 18px;
      vertical-align: -4px;
    }
  }

  .drawer-actions {
    margin-top: 16px;
  }

  code {
    font-size: 12px;
  }
</style>
