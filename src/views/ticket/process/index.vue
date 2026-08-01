<template>
  <PageContainer>
    <QueryTable
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      :columns="columns"
      :data="list"
      :search-form-model="query"
      :scroll="{ x: 1300 }"
      column-resizable
      @page-change="onPageChange"
      @refresh="fetchList"
    >
      <template #search>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="keyword" label="关键字">
              <a-input
                v-model="query.keyword"
                allow-clear
                placeholder="工单号/标题/内容"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="工单状态">
              <a-select
                v-model="query.status"
                allow-clear
                placeholder="工单状态"
              >
                <a-option :value="WorkTicketStatus.Pending">待处理</a-option>
                <a-option :value="WorkTicketStatus.Processing">处理中</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-space :size="18">
              <a-button type="primary" @click="search">
                <template #icon><icon-search /></template>
                查询
              </a-button>
              <a-button @click="resetQuery">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </template>
      <template #images="{ record }">
        <a-space v-if="record.images?.length" :size="4">
          <a-image
            v-for="(img, index) in record.images"
            :key="`${record.id}-${index}`"
            :src="resolveApiUrl(img.proxyUrl)"
            width="40"
            height="40"
            fit="cover"
          />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #status="{ record }">
        <DictTag type-code="work_ticket_status" :value="String(record.status)" />
      </template>
      <template #creationTime="{ record }">
        {{ formatTime(record.creationTime) }}
      </template>
      <template #operations="{ record }">
        <a-button
          type="text"
          size="small"
          v-permission="[Permissions.Ticket.Work.Process]"
          @click="openProcessModal(record)"
        >
          处理
        </a-button>
      </template>
    </QueryTable>

    <a-modal
      v-model:visible="modalVisible"
      title="工单处理"
      :ok-loading="submitting"
      :width="720"
      unmount-on-close
      @before-ok="handleSubmit"
      @cancel="resetForm"
    >
      <a-descriptions v-if="currentTicket" :column="1" bordered size="medium" class="ticket-info">
        <a-descriptions-item label="工单号">
          {{ currentTicket.ticketNo }}
        </a-descriptions-item>
        <a-descriptions-item label="标题">
          {{ currentTicket.title }}
        </a-descriptions-item>
        <a-descriptions-item label="内容">
          {{ currentTicket.content }}
        </a-descriptions-item>
        <a-descriptions-item label="创建人">
          {{ currentTicket.creatorName || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="附件图片">
          <a-space v-if="currentTicket.images?.length" :size="8">
            <a-image
              v-for="(img, index) in currentTicket.images"
              :key="`${currentTicket.id}-img-${index}`"
              :src="resolveApiUrl(img.proxyUrl)"
              width="64"
              height="64"
              fit="cover"
            />
          </a-space>
          <span v-else>-</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item label="处理状态" field="status">
          <a-select v-model="form.status" placeholder="请选择处理状态">
            <a-option :value="WorkTicketStatus.Processing">处理中</a-option>
            <a-option :value="WorkTicketStatus.Resolved">已解决</a-option>
            <a-option :value="WorkTicketStatus.Closed">已关闭</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理结果" field="processResult">
          <a-textarea
            v-model="form.processResult"
            :auto-size="{ minRows: 4, maxRows: 8 }"
            placeholder="请填写处理说明或结论"
          />
        </a-form-item>
        <a-form-item label="处理结果图片" field="processResultImages">
          <a-upload
            list-type="picture-card"
            accept="image/*"
            image-preview
            :limit="MAX_WORK_TICKET_IMAGES"
            :file-list="fileList"
            :custom-request="handleUpload"
            @change="handleUploadChange"
          />
          <div class="upload-tip">最多上传 {{ MAX_WORK_TICKET_IMAGES }} 张图片</div>
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import { Message, type FieldRule, type FileItem, type FormInstance } from '@arco-design/web-vue';
  import type { RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import QueryTable from '@/components/common/QueryTable.vue';
  import DictTag from '@/components/dict-tag/index.vue';
  import { Permissions } from '@/constants/permissions';
  import { uploadFile } from '@/api/server/common/file';
  import { resolveApiUrl } from '@/utils/asset-url';
  import {
    MAX_WORK_TICKET_IMAGES,
    WorkTicketStatus,
    processWorkTicket,
    queryWorkTicketProcessPage,
    type WorkTicketDto,
    type WorkTicketImageDto,
  } from '@/api/server/ticket/work-ticket';
  import type { EntityId } from '@/types/entity-id';

  const loading = ref(false);
  const submitting = ref(false);
  const modalVisible = ref(false);
  const formRef = ref<FormInstance>();
  const list = ref<WorkTicketDto[]>([]);
  const currentTicket = ref<WorkTicketDto>();
  const fileList = ref<FileItem[]>([]);
  const uploadedImages = ref<WorkTicketImageDto[]>([]);
  const uploadingCount = ref(0);

  const query = reactive({
    keyword: '',
    status: undefined as WorkTicketStatus | undefined,
    current: 1,
    pageSize: 10,
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
  });

  const form = reactive({
    status: WorkTicketStatus.Processing as WorkTicketStatus,
    processResult: '',
  });

  const rules: Record<string, FieldRule | FieldRule[]> = {
    status: [{ required: true, message: '请选择处理状态' }],
    processResult: [{ required: true, message: '请填写处理结果' }],
  };

  const formatTime = (value?: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

  const columns: TableColumnData[] = [
    { title: '工单号', dataIndex: 'ticketNo', width: 180 },
    { title: '标题', dataIndex: 'title', ellipsis: true, tooltip: true, width: 180 },
    { title: '图片', slotName: 'images', width: 160 },
    { title: '状态', slotName: 'status', width: 100 },
    { title: '创建人', dataIndex: 'creatorName', width: 120 },
    { title: '创建时间', slotName: 'creationTime', width: 180 },
    { title: '操作', slotName: 'operations', fixed: 'right', width: 100 },
  ];

  async function fetchList() {
    loading.value = true;
    try {
      const { data } = await queryWorkTicketProcessPage({
        keyword: query.keyword || undefined,
        status: query.status,
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
      list.value = data.items;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function search() {
    pagination.current = 1;
    fetchList();
  }

  function resetQuery() {
    query.keyword = '';
    query.status = undefined;
    search();
  }

  function onPageChange(page: number) {
    pagination.current = page;
    fetchList();
  }

  function resetForm() {
    currentTicket.value = undefined;
    form.status = WorkTicketStatus.Processing;
    form.processResult = '';
    fileList.value = [];
    uploadedImages.value = [];
    formRef.value?.clearValidate();
  }

  function openProcessModal(record: WorkTicketDto) {
    resetForm();
    currentTicket.value = record;
    modalVisible.value = true;
  }

  function handleUpload(option: RequestOption) {
    const { fileItem, onSuccess, onError } = option;
    const rawFile = fileItem.file;

    void (async () => {
      if (!rawFile) {
        onError?.();
        return;
      }

      if (uploadedImages.value.length >= MAX_WORK_TICKET_IMAGES) {
        Message.warning(`最多上传 ${MAX_WORK_TICKET_IMAGES} 张图片`);
        onError?.();
        return;
      }

      uploadingCount.value += 1;
      try {
        const { data } = await uploadFile(rawFile, 'work-ticket');
        const image: WorkTicketImageDto = {
          objectKey: data.objectKey,
          proxyUrl: data.proxyUrl,
          fileName: data.fileName,
        };
        onSuccess?.(image);
      } catch {
        Message.error('图片上传失败');
        onError?.();
      } finally {
        uploadingCount.value -= 1;
      }
    })();

    return {
      abort() {},
    };
  }

  function handleUploadChange(items: FileItem[]) {
    fileList.value = items;
    uploadedImages.value = items
      .filter((item) => item.status === 'done' && item.response)
      .map((item) => item.response as WorkTicketImageDto);
  }

  async function handleSubmit() {
    const errors = await formRef.value?.validate();
    if (errors || !currentTicket.value) {
      return false;
    }

    if (uploadingCount.value > 0) {
      Message.warning('图片上传中，请稍候');
      return false;
    }

    submitting.value = true;
    try {
      await processWorkTicket({
        id: currentTicket.value.id as EntityId,
        status: form.status,
        processResult: form.processResult,
        processResultImages: uploadedImages.value,
      });
      Message.success('处理成功');
      modalVisible.value = false;
      resetForm();
      fetchList();
      return true;
    } catch {
      return false;
    } finally {
      submitting.value = false;
    }
  }

  onMounted(() => {
    fetchList();
  });
</script>

<style scoped lang="less">
  .ticket-info {
    margin-bottom: 8px;
  }

  .upload-tip {
    margin-top: 4px;
    color: var(--color-text-3);
    font-size: 12px;
  }
</style>
