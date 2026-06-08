<template>
  <a-spin style="display: block" :loading="loading">
    <div class="export-box-header">{{ $t('exportBox.title') }}</div>
    <a-empty v-if="!taskList.length" class="export-empty">
      {{ $t('exportBox.empty') }}
    </a-empty>
    <List v-else :render-list="taskList" @download="handleDownload" />
  </a-spin>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    ExportTaskDto,
    getExportDownloadUrl,
    getExportTaskList,
  } from '@/api/server/export-task';
  import {
    RealtimeEvents,
    type ExportTaskChangedPayload,
  } from '@/api/server/realtime';
  import useLoading from '@/hooks/loading';
  import useExportTasks from '@/hooks/export-tasks';
  import { onRealtimeEvent } from '@/utils/realtime-hub';
  import List from './list.vue';

  const { loading, setLoading } = useLoading(true);
  const { refreshActiveCount } = useExportTasks();
  const taskList = ref<ExportTaskDto[]>([]);
  let unsubscribeRealtime: (() => void) | null = null;

  function upsertTask(task: ExportTaskDto) {
    const index = taskList.value.findIndex((item) => item.id === task.id);
    if (index >= 0) {
      taskList.value[index] = task;
      return;
    }

    taskList.value = [task, ...taskList.value];
  }

  async function fetchList() {
    try {
      const { data } = await getExportTaskList();
      taskList.value = data;
      await refreshActiveCount();
    } catch {
      // ignore
    }
  }

  async function load() {
    setLoading(true);
    try {
      await fetchList();
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(item: ExportTaskDto) {
    try {
      const { data } = await getExportDownloadUrl(item.id);
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch {
      Message.error('下载失败');
    }
  }

  onMounted(async () => {
    unsubscribeRealtime = onRealtimeEvent(
      RealtimeEvents.ExportTaskChanged,
      (data) => {
        const payload = data as ExportTaskChangedPayload;
        upsertTask(payload.task);
        void refreshActiveCount();
      }
    );
    await load();
  });

  onUnmounted(() => {
    unsubscribeRealtime?.();
  });

  defineExpose({
    refresh: load,
  });
</script>

<style scoped lang="less">
  .export-box-header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid var(--color-border-2);
  }

  .export-empty {
    padding: 32px 0;
  }
</style>
