<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.jobList']">
    <a-card class="general-card" title="定时任务">
      <a-form :model="query" layout="inline" class="job-search">
        <a-form-item field="keyword">
          <a-input
            v-model="query.keyword"
            allow-clear
            placeholder="编码/名称"
          />
        </a-form-item>
        <a-form-item field="isEnabled">
          <a-select
            v-model="query.isEnabled"
            allow-clear
            placeholder="状态"
            style="width: 120px"
          >
            <a-option :value="true">启用</a-option>
            <a-option :value="false">禁用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="resetQuery">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <div class="job-toolbar">
        <a-button
          type="primary"
          v-permission="[Permissions.System.Job.Create]"
          @click="handleAdd"
        >
          <template #icon><icon-plus /></template>
          新增任务
        </a-button>
      </div>

      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="list"
        :scroll="{ x: 1180 }"
        column-resizable
        :bordered="{ cell: true }"
        @page-change="onPageChange"
      >
        <template #jobType="{ record }">
          {{ record.jobType === 1 ? 'HTTP API' : record.jobType }}
        </template>
        <template #httpMethod="{ record }">
          {{ httpMethodLabel(record.httpMethod) }}
        </template>
        <template #isEnabled="{ record }">
          <a-tag :color="record.isEnabled ? 'green' : 'red'">
            {{ record.isEnabled ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template #lastRun="{ record }">
          <div v-if="record.lastRunTime" class="last-run-cell">
            <a-tag
              size="small"
              :color="record.lastRunStatus === 1 ? 'green' : 'red'"
            >
              {{ record.lastRunStatus === 1 ? '成功' : '失败' }}
            </a-tag>
            <span>{{ formatTime(record.lastRunTime) }}</span>
          </div>
          <span v-else>-</span>
        </template>
        <template #operations="{ record }">
          <a-space size="small" class="table-operations">
            <a-button type="text" size="small" @click="openLogs(record)">
              日志
            </a-button>
            <a-button
              type="text"
              size="small"
              v-permission="[Permissions.System.Job.Trigger]"
              @click="handleTrigger(record.id)"
            >
              执行
            </a-button>
            <a-tooltip content="编辑">
              <a-button
                type="text"
                size="small"
                v-permission="[Permissions.System.Job.Update]"
                @click="handleEdit(record)"
              >
                <template #icon><icon-edit /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm content="确定删除该任务吗？" @ok="handleDelete(record.id)">
              <a-button
                type="text"
                size="small"
                status="danger"
                v-permission="[Permissions.System.Job.Delete]"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      width="720px"
      unmount-on-close
      :body-style="{ maxHeight: '70vh', overflow: 'auto' }"
      @close="resetForm"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="formRef" layout="vertical" :model="form" class="job-modal-form">
        <a-row :gutter="16">
          <a-col v-if="!isEdit" :span="12">
            <a-form-item
              field="jobCode"
              label="任务编码"
              :rules="[{ required: true, message: '任务编码不能为空' }]"
            >
              <a-input v-model="form.jobCode" placeholder="如 sync-order-status" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="name"
              label="任务名称"
              :rules="[{ required: true, message: '任务名称不能为空' }]"
            >
              <a-input v-model="form.name" />
            </a-form-item>
          </a-col>
          <a-col v-if="isEdit" :span="12">
            <a-form-item label="任务编码">
              <a-input :model-value="form.jobCode" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item
              field="cronExpression"
              label="Cron 表达式"
              :rules="[{ required: true, message: 'Cron 表达式不能为空' }]"
            >
              <a-input
                v-model="form.cronExpression"
                placeholder="0 */5 * * * ? 或 0 0 * * *"
                @blur="handleValidateCron"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="timeZoneId" label="时区">
              <a-input v-model="form.timeZoneId" placeholder="Asia/Shanghai" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-alert
          v-if="cronPreview.length"
          type="info"
          class="cron-preview"
          :show-icon="false"
        >
          下次执行：{{ cronPreview.join('、') }}
        </a-alert>
        <a-alert
          v-if="cronError"
          type="error"
          class="cron-preview"
          :show-icon="false"
        >
          {{ cronError }}
        </a-alert>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="httpMethod" label="HTTP 方法">
              <a-select v-model="form.httpMethod">
                <a-option :value="1">GET</a-option>
                <a-option :value="2">POST</a-option>
                <a-option :value="3">PUT</a-option>
                <a-option :value="4">DELETE</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="timeoutSeconds" label="超时(秒)">
              <a-input-number
                v-model="form.timeoutSeconds"
                :min="1"
                :max="600"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="isEnabled" label="是否启用">
              <a-switch v-model="form.isEnabled" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          field="httpUrl"
          label="请求 URL"
          :rules="[{ required: true, message: '请求 URL 不能为空' }]"
        >
          <a-input v-model="form.httpUrl" placeholder="https://api.example.com/hook" />
        </a-form-item>

        <a-form-item field="httpHeadersJson" label="请求头 JSON">
          <a-textarea
            v-model="form.httpHeadersJson"
            :auto-size="{ minRows: 2, maxRows: 4 }"
            placeholder='{"Authorization":"Bearer xxx"}'
          />
        </a-form-item>

        <a-form-item
          v-if="form.httpMethod === 2 || form.httpMethod === 3"
          field="httpBody"
          label="请求体"
        >
          <a-textarea
            v-model="form.httpBody"
            :auto-size="{ minRows: 3, maxRows: 8 }"
            placeholder='{"key":"value"}'
          />
        </a-form-item>

        <a-form-item field="description" label="备注">
          <a-input v-model="form.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:visible="logDrawerVisible"
      :title="`执行日志 - ${currentJob?.name || ''}`"
      :width="720"
      unmount-on-close
    >
      <a-table
        row-key="id"
        :loading="logLoading"
        :pagination="logPagination"
        :columns="logColumns"
        :data="logList"
        @page-change="onLogPageChange"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </template>
        <template #trigger="{ record }">
          {{ record.isManualTrigger ? '手动' : '定时' }}
        </template>
        <template #startedAt="{ record }">
          {{ formatTime(record.startedAt) }}
        </template>
      </a-table>
    </a-drawer>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue/es/form';
  import useLoading from '@/hooks/loading';
  import { clearFormValidate } from '@/utils/form';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';
  import {
    queryScheduledJobPage,
    addScheduledJob,
    updateScheduledJob,
    deleteScheduledJob,
    triggerScheduledJob,
    queryScheduledJobLogs,
    validateCronExpression,
    ScheduledJobDto,
    ScheduledJobLogDto,
    ScheduledJobHttpMethod,
  } from '@/api/server/system/scheduled-job';

  defineOptions({ name: 'ScheduledJobList' });

  const { loading, setLoading } = useLoading(true);
  const logLoading = ref(false);

  const list = ref<ScheduledJobDto[]>([]);
  const logList = ref<ScheduledJobLogDto[]>([]);
  const currentJob = ref<ScheduledJobDto | null>(null);

  const query = reactive({
    keyword: '',
    isEnabled: undefined as boolean | undefined,
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const logPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: TableColumnData[] = [
    { title: '编码', dataIndex: 'jobCode', width: 140, ellipsis: true, tooltip: true },
    { title: '名称', dataIndex: 'name', width: 140, ellipsis: true, tooltip: true },
    { title: '类型', dataIndex: 'jobType', slotName: 'jobType', width: 90 },
    { title: 'Cron', dataIndex: 'cronExpression', ellipsis: true, tooltip: true, width: 130 },
    { title: '方法', dataIndex: 'httpMethod', slotName: 'httpMethod', width: 80 },
    { title: 'URL', dataIndex: 'httpUrl', ellipsis: true, tooltip: true, width: 200 },
    { title: '状态', dataIndex: 'isEnabled', slotName: 'isEnabled', width: 80 },
    { title: '最近执行', slotName: 'lastRun', width: 180 },
    {
      title: '操作',
      dataIndex: 'operations',
      slotName: 'operations',
      width: 220,
      fixed: 'right',
      align: 'center',
    },
  ];

  const logColumns: TableColumnData[] = [
    { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
    { title: '触发', dataIndex: 'isManualTrigger', slotName: 'trigger', width: 70 },
    { title: 'HTTP', dataIndex: 'httpStatusCode', width: 70 },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 90 },
    { title: '开始时间', dataIndex: 'startedAt', slotName: 'startedAt', width: 170 },
    { title: '错误', dataIndex: 'errorMessage', ellipsis: true, tooltip: true },
  ];

  const modalVisible = ref(false);
  const logDrawerVisible = ref(false);
  const isEdit = ref(false);
  const editingId = ref<EntityId | null>(null);
  const formRef = ref<FormInstance>();
  const cronPreview = ref<string[]>([]);
  const cronError = ref('');

  const form = reactive({
    jobCode: '',
    name: '',
    cronExpression: '',
    timeZoneId: 'Asia/Shanghai',
    isEnabled: true,
    description: '',
    httpMethod: ScheduledJobHttpMethod.Get as number,
    httpUrl: '',
    httpHeadersJson: '',
    httpBody: '',
    timeoutSeconds: 30,
  });

  const httpMethodLabel = (method: number) => {
    const map: Record<number, string> = {
      1: 'GET',
      2: 'POST',
      3: 'PUT',
      4: 'DELETE',
    };
    return map[method] || String(method);
  };

  const formatTime = (value?: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await queryScheduledJobPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: query.keyword || undefined,
        isEnabled: query.isEnabled,
      });
      list.value = data.items;
      pagination.total = data.total;
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    pagination.current = 1;
    fetchList();
  };

  const resetQuery = () => {
    query.keyword = '';
    query.isEnabled = undefined;
    search();
  };

  const onPageChange = (page: number) => {
    pagination.current = page;
    fetchList();
  };

  const resetForm = () => {
    form.jobCode = '';
    form.name = '';
    form.cronExpression = '';
    form.timeZoneId = 'Asia/Shanghai';
    form.isEnabled = true;
    form.description = '';
    form.httpMethod = ScheduledJobHttpMethod.Get;
    form.httpUrl = '';
    form.httpHeadersJson = '';
    form.httpBody = '';
    form.timeoutSeconds = 30;
    cronPreview.value = [];
    cronError.value = '';
    editingId.value = null;
    clearFormValidate(formRef.value);
  };

  const handleValidateCron = async () => {
    cronPreview.value = [];
    cronError.value = '';
    if (!form.cronExpression.trim()) {
      return;
    }
    try {
      const { data } = await validateCronExpression(form.cronExpression.trim());
      if (!data.isValid) {
        cronError.value = data.errorMessage || 'Cron 表达式无效';
        return;
      }
      cronPreview.value = (data.nextOccurrences || []).map((item) =>
        dayjs(item).format('YYYY-MM-DD HH:mm:ss')
      );
    } catch {
      cronError.value = 'Cron 校验失败';
    }
  };

  const handleAdd = () => {
    isEdit.value = false;
    resetForm();
    modalVisible.value = true;
  };

  const handleEdit = (record: ScheduledJobDto) => {
    isEdit.value = true;
    editingId.value = record.id;
    form.jobCode = record.jobCode;
    form.name = record.name;
    form.cronExpression = record.cronExpression;
    form.timeZoneId = record.timeZoneId;
    form.isEnabled = record.isEnabled;
    form.description = record.description || '';
    form.httpMethod = record.httpMethod;
    form.httpUrl = record.httpUrl;
    form.httpHeadersJson = record.httpHeadersJson || '';
    form.httpBody = record.httpBody || '';
    form.timeoutSeconds = record.timeoutSeconds;
    cronPreview.value = [];
    cronError.value = '';
    modalVisible.value = true;
    void handleValidateCron();
  };

  const handleBeforeOk = async () => {
    const errors = await formRef.value?.validate();
    if (errors) {
      return false;
    }

    await handleValidateCron();
    if (cronError.value) {
      return false;
    }

    try {
      if (isEdit.value && editingId.value != null) {
        await updateScheduledJob({
          id: editingId.value,
          name: form.name,
          cronExpression: form.cronExpression,
          timeZoneId: form.timeZoneId,
          isEnabled: form.isEnabled,
          description: form.description || undefined,
          httpMethod: form.httpMethod,
          httpUrl: form.httpUrl,
          httpHeadersJson: form.httpHeadersJson || undefined,
          httpBody: form.httpBody || undefined,
          timeoutSeconds: form.timeoutSeconds,
        });
        Message.success('更新成功');
      } else {
        await addScheduledJob({
          jobCode: form.jobCode,
          name: form.name,
          cronExpression: form.cronExpression,
          timeZoneId: form.timeZoneId,
          isEnabled: form.isEnabled,
          description: form.description || undefined,
          httpMethod: form.httpMethod,
          httpUrl: form.httpUrl,
          httpHeadersJson: form.httpHeadersJson || undefined,
          httpBody: form.httpBody || undefined,
          timeoutSeconds: form.timeoutSeconds,
        });
        Message.success('创建成功');
      }
      await fetchList();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: EntityId) => {
    await deleteScheduledJob(id);
    Message.success('删除成功');
    await fetchList();
  };

  const handleTrigger = async (id: EntityId) => {
    await triggerScheduledJob(id);
    Message.success('已提交执行');
    await fetchList();
  };

  const fetchLogs = async () => {
    if (!currentJob.value) {
      return;
    }
    logLoading.value = true;
    try {
      const { data } = await queryScheduledJobLogs(
        currentJob.value.id,
        logPagination.current,
        logPagination.pageSize
      );
      logList.value = data.items;
      logPagination.total = data.total;
    } finally {
      logLoading.value = false;
    }
  };

  const openLogs = async (record: ScheduledJobDto) => {
    currentJob.value = record;
    logPagination.current = 1;
    logDrawerVisible.value = true;
    await fetchLogs();
  };

  const onLogPageChange = async (page: number) => {
    logPagination.current = page;
    await fetchLogs();
  };

  onMounted(fetchList);
</script>

<style scoped lang="less">
  .job-search {
    margin-bottom: 12px;
  }

  .job-toolbar {
    margin-bottom: 12px;
  }

  .cron-preview {
    margin-bottom: 12px;
  }

  .last-run-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .table-operations {
    white-space: nowrap;
  }

  .job-modal-form {
    :deep(.arco-form-item) {
      margin-bottom: 12px;
    }

    :deep(.arco-input-wrapper),
    :deep(.arco-select),
    :deep(.arco-textarea-wrapper) {
      width: 100%;
    }
  }
</style>
