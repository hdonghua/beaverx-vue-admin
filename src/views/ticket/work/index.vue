<template>
  <PageContainer :breadcrumb="['menu.ticket', 'menu.ticket.work']">
    <a-card class="general-card">
      <a-form :model="query" layout="inline" class="search-form">
        <a-form-item field="keyword">
          <a-input
            v-model="query.keyword"
            allow-clear
            placeholder="工单号/标题/内容"
          />
        </a-form-item>
        <a-form-item field="status">
          <DictSelect
            v-model="query.status"
            type-code="work_ticket_status"
            value-type="number"
            allow-clear
            placeholder="工单状态"
            style="width: 140px"
          />
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

      <div class="toolbar">
        <a-button
          type="primary"
          v-permission="[Permissions.Ticket.Work.Create]"
          @click="handleAdd"
        >
          <template #icon><icon-plus /></template>
          新增工单
        </a-button>
      </div>

      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="list"
        :scroll="{ x: 1200 }"
        column-resizable
        :bordered="{ cell: true }"
        @page-change="onPageChange"
      >
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
        <template #processResult="{ record }">
          <a-typography-paragraph
            v-if="record.processResult"
            :ellipsis="{ rows: 2, showTooltip: true }"
          >
            {{ record.processResult }}
          </a-typography-paragraph>
          <span v-else>-</span>
        </template>
        <template #processedTime="{ record }">
          {{ formatTime(record.processedTime) }}
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button
              v-if="canEdit(record)"
              type="text"
              size="small"
              v-permission="[Permissions.Ticket.Work.Update]"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.processResult"
              type="text"
              size="small"
              @click="openResultModal(record)"
            >
              处理结果
            </a-button>
            <a-popconfirm
              content="确定删除该工单吗？"
              @ok="handleDelete(record.id)"
            >
              <a-button
                type="text"
                size="small"
                status="danger"
                v-permission="[Permissions.Ticket.Work.Delete]"
              >
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :ok-loading="submitting"
      :width="640"
      unmount-on-close
      @before-ok="handleSubmit"
      @cancel="resetForm"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item label="标题" field="title">
          <a-input v-model="form.title" allow-clear placeholder="请输入工单标题" />
        </a-form-item>
        <a-form-item label="内容" field="content">
          <a-textarea
            v-model="form.content"
            :auto-size="{ minRows: 4, maxRows: 8 }"
            placeholder="请描述问题或需求"
          />
        </a-form-item>
        <a-form-item label="图片" field="images">
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

    <a-modal
      v-model:visible="resultModalVisible"
      title="处理结果"
      :footer="false"
      :width="640"
      unmount-on-close
    >
      <template v-if="resultTicket">
        <a-descriptions :column="1" bordered size="medium">
          <a-descriptions-item label="处理人">
            {{ resultTicket.handlerName || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="处理时间">
            {{ formatTime(resultTicket.processedTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="处理状态">
            <DictTag
              type-code="work_ticket_status"
              :value="String(resultTicket.status)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="处理结果">
            {{ resultTicket.processResult }}
          </a-descriptions-item>
          <a-descriptions-item label="结果图片">
            <a-space v-if="resultTicket.processResultImages?.length" :size="8">
              <a-image
                v-for="(img, index) in resultTicket.processResultImages"
                :key="`${resultTicket.id}-result-${index}`"
                :src="resolveApiUrl(img.proxyUrl)"
                width="80"
                height="80"
                fit="cover"
              />
            </a-space>
            <span v-else>-</span>
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import { Message, type FieldRule, type FileItem, type FormInstance } from '@arco-design/web-vue';
  import type { RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
  import PageContainer from '@/components/page-container/index.vue';
  import DictSelect from '@/components/dict-select/index.vue';
  import DictTag from '@/components/dict-tag/index.vue';
  import { Permissions } from '@/constants/permissions';
  import { uploadFile } from '@/api/server/common/file';
  import { resolveApiUrl } from '@/utils/asset-url';
  import {
    MAX_WORK_TICKET_IMAGES,
    WorkTicketStatus,
    addWorkTicket,
    deleteWorkTicket,
    queryWorkTicketPage,
    updateWorkTicket,
    type WorkTicketDto,
    type WorkTicketImageDto,
  } from '@/api/server/ticket/work-ticket';
  import type { EntityId } from '@/types/entity-id';

  const loading = ref(false);
  const submitting = ref(false);
  const modalVisible = ref(false);
  const resultModalVisible = ref(false);
  const editingId = ref<EntityId>();
  const resultTicket = ref<WorkTicketDto>();
  const formRef = ref<FormInstance>();
  const list = ref<WorkTicketDto[]>([]);
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
    title: '',
    content: '',
  });

  const rules: Record<string, FieldRule | FieldRule[]> = {
    title: [{ required: true, message: '请输入工单标题' }],
    content: [{ required: true, message: '请输入工单内容' }],
  };

  const modalTitle = computed(() => (editingId.value ? '编辑工单' : '新增工单'));

  const formatTime = (value?: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

  const columns = [
    { title: '工单号', dataIndex: 'ticketNo', width: 180 },
    { title: '标题', dataIndex: 'title', ellipsis: true, tooltip: true, width: 160 },
    { title: '图片', slotName: 'images', width: 140 },
    { title: '状态', slotName: 'status', width: 100 },
    { title: '处理结果', slotName: 'processResult', width: 180 },
    { title: '处理人', dataIndex: 'handlerName', width: 100 },
    { title: '处理时间', slotName: 'processedTime', width: 170 },
    { title: '创建人', dataIndex: 'creatorName', width: 100 },
    { title: '创建时间', slotName: 'creationTime', width: 170 },
    { title: '操作', slotName: 'operations', fixed: 'right', width: 180 },
  ];

  function canEdit(record: WorkTicketDto) {
    return (
      record.status !== WorkTicketStatus.Resolved &&
      record.status !== WorkTicketStatus.Closed
    );
  }

  function openResultModal(record: WorkTicketDto) {
    resultTicket.value = record;
    resultModalVisible.value = true;
  }

  async function fetchList() {
    loading.value = true;
    try {
      const { data } = await queryWorkTicketPage({
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
    editingId.value = undefined;
    form.title = '';
    form.content = '';
    fileList.value = [];
    uploadedImages.value = [];
    formRef.value?.clearValidate();
  }

  function handleAdd() {
    resetForm();
    modalVisible.value = true;
  }

  function handleEdit(record: WorkTicketDto) {
    resetForm();
    editingId.value = record.id;
    form.title = record.title;
    form.content = record.content;
    uploadedImages.value = [...(record.images || [])];
    fileList.value = uploadedImages.value.map((img, index) => ({
      uid: `${record.id}-${index}`,
      name: img.fileName,
      url: resolveApiUrl(img.proxyUrl),
      status: 'done',
      response: img,
    }));
    modalVisible.value = true;
  }

  async function handleDelete(id: EntityId) {
    await deleteWorkTicket(id);
    Message.success('删除成功');
    fetchList();
  }

  async function handleUpload(option: RequestOption) {
    const { fileItem, onSuccess, onError } = option;
    const rawFile = fileItem.file;
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
  }

  function handleUploadChange(items: FileItem[]) {
    fileList.value = items;
    uploadedImages.value = items
      .filter((item) => item.status === 'done' && item.response)
      .map((item) => item.response as WorkTicketImageDto);
  }

  async function handleSubmit() {
    const errors = await formRef.value?.validate();
    if (errors) {
      return false;
    }

    if (uploadingCount.value > 0) {
      Message.warning('图片上传中，请稍候');
      return false;
    }

    submitting.value = true;
    try {
      if (editingId.value) {
        await updateWorkTicket({
          id: editingId.value,
          title: form.title,
          content: form.content,
          images: uploadedImages.value,
        });
        Message.success('更新成功');
      } else {
        await addWorkTicket({
          title: form.title,
          content: form.content,
          images: uploadedImages.value,
        });
        Message.success('创建成功');
      }
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
  .search-form {
    margin-bottom: 16px;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .upload-tip {
    margin-top: 4px;
    color: var(--color-text-3);
    font-size: 12px;
  }
</style>
