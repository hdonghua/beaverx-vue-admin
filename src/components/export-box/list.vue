<template>
  <a-list :bordered="false" :max-height="360" class="export-list">
    <a-list-item
      v-for="item in renderList"
      :key="item.id"
      action-layout="vertical"
      class="export-item"
    >
      <template #extra>
        <a-tag :color="statusColor(item.status)" size="small">
          {{ statusText(item.status) }}
        </a-tag>
      </template>
      <a-list-item-meta>
        <template #title>
          <div class="item-title">
            <icon-file class="item-icon" />
            <span class="item-title-text">{{ item.fileName }}</span>
          </div>
        </template>
        <template #description>
          <p class="item-content">{{ exportTypeText(item.exportType) }}</p>
          <p v-if="item.errorMessage" class="item-error">{{ item.errorMessage }}</p>
          <span class="item-time">{{ formatTime(item.creationTime) }}</span>
        </template>
      </a-list-item-meta>
      <template v-if="item.status === 2" #actions>
        <a-button type="text" size="small" @click="emit('download', item)">
          <template #icon><icon-download /></template>
          {{ $t('exportBox.download') }}
        </a-button>
      </template>
    </a-list-item>
  </a-list>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import dayjs from 'dayjs';
  import {
    ExportTaskDto,
    ExportTaskStatus,
    ExportTypes,
  } from '@/api/server/system/export-task';

  defineProps({
    renderList: {
      type: Array as PropType<ExportTaskDto[]>,
      required: true,
    },
  });

  const emit = defineEmits<{
    download: [ExportTaskDto];
  }>();

  const { t } = useI18n();

  const statusText = (status: ExportTaskStatus) => {
    switch (status) {
      case ExportTaskStatus.Pending:
        return t('exportBox.status.pending');
      case ExportTaskStatus.Processing:
        return t('exportBox.status.processing');
      case ExportTaskStatus.Completed:
        return t('exportBox.status.completed');
      case ExportTaskStatus.Failed:
        return t('exportBox.status.failed');
      default:
        return '';
    }
  };

  const statusColor = (status: ExportTaskStatus) => {
    switch (status) {
      case ExportTaskStatus.Pending:
        return 'gray';
      case ExportTaskStatus.Processing:
        return 'arcoblue';
      case ExportTaskStatus.Completed:
        return 'green';
      case ExportTaskStatus.Failed:
        return 'red';
      default:
        return 'gray';
    }
  };

  const exportTypeText = (exportType: string) => {
    switch (exportType) {
      case ExportTypes.SystemUser:
        return t('exportBox.export.user');
      case ExportTypes.SystemConfig:
        return t('exportBox.export.config');
      case ExportTypes.SystemDictData:
        return t('exportBox.export.dictData');
      default:
        return exportType;
    }
  };

  const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');
</script>

<style scoped lang="less">
  .export-list {
    :deep(.arco-list-item) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border-2);

      &:last-child {
        border-bottom: none;
      }
    }

    :deep(.arco-list-item-extra) {
      position: absolute;
      top: 14px;
      right: 16px;
    }
  }

  .item-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding-right: 72px;
  }

  .item-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: rgb(var(--primary-6));
  }

  .item-title-text {
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-content {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--color-text-3);
  }

  .item-error {
    margin: 4px 0 0;
    font-size: 12px;
    color: rgb(var(--danger-6));
  }

  .item-time {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-4);
  }
</style>
