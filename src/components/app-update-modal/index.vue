<template>
  <a-modal
    :visible="visible"
    title="发现新版本"
    :closable="false"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    unmount-on-close
  >
    <p>
      系统已更新，请刷新页面并清除浏览器缓存，以加载最新功能与修复。
    </p>
    <div class="app-update-modal__footer">
      <a-button @click="emit('snooze')">稍后</a-button>
      <a-button type="primary" @click="emit('refresh')">立即刷新</a-button>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'snooze'): void;
    (e: 'refresh'): void;
  }>();
</script>

<style scoped lang="less">
  .app-update-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  }
</style>
