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
    ExportTaskStatus,
    getExportDownloadUrl,
    getExportTaskList,
  } from '@/api/server/export-task';
  import useLoading from '@/hooks/loading';
  import useExportTasks from '@/hooks/export-tasks';
  import List from './list.vue';

  const { loading, setLoading } = useLoading(true);
  const { refreshActiveCount } = useExportTasks();
  const taskList = ref<ExportTaskDto[]>([]);
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const hasActiveTask = () =>
    taskList.value.some(
      (item) =>
        item.status === ExportTaskStatus.Pending ||
        item.status === ExportTaskStatus.Processing
    );

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

  function startPolling() {
    if (pollTimer) {
      return;
    }
    pollTimer = setInterval(async () => {
      await fetchList();
      if (!hasActiveTask()) {
        stopPolling();
      }
    }, 3000);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
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
    await load();
    if (hasActiveTask()) {
      startPolling();
    }
  });

  onUnmounted(stopPolling);

  defineExpose({
    async refresh() {
      await load();
      if (hasActiveTask()) {
        startPolling();
      }
    },
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
