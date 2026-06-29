<template>
  <a-modal
    :visible="visible"
    :title="$t('appUpdate.title')"
    :closable="false"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    unmount-on-close
  >
    <p>{{ $t('appUpdate.content') }}</p>
    <div class="app-update-modal__footer">
      <a-button @click="emit('snooze')">
        {{ $t('appUpdate.later') }}
      </a-button>
      <a-button type="primary" @click="emit('refresh')">
        {{ $t('appUpdate.refresh') }}
      </a-button>
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
