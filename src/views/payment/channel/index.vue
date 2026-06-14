<template>
  <PageContainer :breadcrumb="['menu.payment', 'menu.payment.channel']">
    <a-card class="general-card" title="支付渠道">
      <a-form :model="query" layout="inline" class="search-form">
        <a-form-item field="keyword">
          <a-input v-model="query.keyword" allow-clear placeholder="编码/名称" />
        </a-form-item>
        <a-form-item field="isEnabled">
          <a-select v-model="query.isEnabled" allow-clear placeholder="状态">
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
      <div class="toolbar">
        <a-button
          v-if="canCreate"
          type="primary"
          @click="handleAdd"
        >
          <template #icon><icon-plus /></template>
          新增渠道
        </a-button>
      </div>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="list"
        @page-change="onPageChange"
        column-resizable
        :bordered="{ cell: true }"
      >
        <template #providerType="{ record }">
          {{ providerTypeLabel(record.providerType) }}
        </template>
        <template #isEnabled="{ record }">
          <a-tag :color="record.isEnabled ? 'green' : 'red'">
            {{ record.isEnabled ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button
              v-if="canUpdate"
              type="text"
              size="small"
              @click="handleEdit(record)"
            >
              <template #icon><icon-edit /></template>
            </a-button>
            <a-popconfirm
              v-if="canDelete"
              content="确定删除该渠道吗？"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" size="small" status="danger">
                <template #icon><icon-delete /></template>
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑渠道' : '新增渠道'"
      width="960px"
      unmount-on-close
      :body-style="{ maxHeight: '70vh', overflow: 'auto' }"
      @close="resetForm"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="formRef" layout="vertical" :model="form" class="channel-modal-form">
        <a-row :gutter="16">
          <a-col v-if="!isEdit" :span="12">
            <a-form-item
              field="channelCode"
              label="渠道编码"
              :rules="[{ required: true, message: '渠道编码不能为空' }]"
            >
              <a-input v-model="form.channelCode" placeholder="如 wechat_qrcode" />
            </a-form-item>
          </a-col>
          <a-col :span="isEdit ? 12 : 12">
            <a-form-item
              field="channelName"
              label="渠道名称"
              :rules="[{ required: true, message: '渠道名称不能为空' }]"
            >
              <a-input v-model="form.channelName" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isEdit" :span="12">
            <a-form-item field="providerType" label="支付提供商">
              <a-select
                v-model="form.providerType"
                @change="handleProviderTypeChange"
              >
                <a-option :value="PaymentProviderType.WeChat">微信二维码</a-option>
                <a-option :value="PaymentProviderType.Alipay">支付宝二维码</a-option>
                <a-option :value="PaymentProviderType.AlipayApp">支付宝APP</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-else :span="12">
            <a-form-item label="支付提供商">
              <a-input
                :model-value="providerTypeLabel(form.providerType)"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="sort" label="排序">
              <a-input-number v-model="form.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col v-if="isEdit" :span="12">
            <a-form-item field="isEnabled" label="是否启用">
              <a-switch v-model="form.isEnabled" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="left">渠道配置</a-divider>
        <ChannelConfigForm
          ref="configFormRef"
          :provider-type="form.providerType"
          :config-json="form.configJson"
        />
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item field="notifyUrl" label="回调地址覆盖（可选）">
              <a-input
                v-model="form.notifyUrl"
                placeholder="留空则使用系统默认回调地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="remark" label="备注">
              <a-input v-model="form.remark" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue/es/form';
  import useLoading from '@/hooks/loading';
  import usePermission from '@/hooks/permission';
  import { clearFormValidate } from '@/utils/form';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';
  import {
    buildChannelConfigJson,
    validateChannelConfig,
  } from '@/constants/payment-channel-config';
  import ChannelConfigForm from './components/channel-config-form.vue';
  import {
    PaymentChannelDto,
    PaymentProviderType,
    queryPaymentChannelPage,
    addPaymentChannel,
    updatePaymentChannel,
    deletePaymentChannel,
  } from '@/api/server/payment/channel';

  const { hasPermission } = usePermission();
  const canCreate = computed(() =>
    hasPermission(Permissions.Payment.Channel.Create)
  );
  const canUpdate = computed(() =>
    hasPermission(Permissions.Payment.Channel.Update)
  );
  const canDelete = computed(() =>
    hasPermission(Permissions.Payment.Channel.Delete)
  );

  const { loading, setLoading } = useLoading(true);
  const list = ref<PaymentChannelDto[]>([]);
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
  const query = reactive<{ keyword?: string; isEnabled?: boolean }>({});
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editingId = ref<EntityId | undefined>();
  const formRef = ref<FormInstance>();
  const configFormRef = ref<InstanceType<typeof ChannelConfigForm>>();
  const form = reactive({
    channelCode: '',
    channelName: '',
    providerType: PaymentProviderType.WeChat,
    configJson: '{}',
    notifyUrl: '',
    remark: '',
    sort: 0,
    isEnabled: true,
  });

  const columns: TableColumnData[] = [
    { title: '编码', dataIndex: 'channelCode', width: 140 },
    { title: '名称', dataIndex: 'channelName', width: 140 },
    { title: '提供商', slotName: 'providerType', width: 100 },
    { title: '状态', slotName: 'isEnabled', width: 90 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作', slotName: 'operations', width: 100, fixed: 'right' },
  ];

  function providerTypeLabel(type: PaymentProviderType) {
    if (type === PaymentProviderType.WeChat) return '微信二维码';
    if (type === PaymentProviderType.Alipay) return '支付宝二维码';
    if (type === PaymentProviderType.AlipayApp) return '支付宝APP';
    return '未知';
  }

  async function fetchData() {
    setLoading(true);
    try {
      const { data } = await queryPaymentChannelPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: query.keyword,
        isEnabled: query.isEnabled,
      });
      list.value = data.items;
      pagination.total = data.total;
    } finally {
      setLoading(false);
    }
  }

  function search() {
    pagination.current = 1;
    fetchData();
  }

  function resetQuery() {
    query.keyword = undefined;
    query.isEnabled = undefined;
    search();
  }

  function onPageChange(page: number) {
    pagination.current = page;
    fetchData();
  }

  function resetForm() {
    form.channelCode = '';
    form.channelName = '';
    form.providerType = PaymentProviderType.WeChat;
    form.configJson = '{}';
    form.notifyUrl = '';
    form.remark = '';
    form.sort = 0;
    form.isEnabled = true;
    configFormRef.value?.resetValues();
    clearFormValidate(formRef);
  }

  function handleProviderTypeChange() {
    form.configJson = '{}';
    configFormRef.value?.resetValues();
  }

  function handleAdd() {
    isEdit.value = false;
    editingId.value = undefined;
    resetForm();
    modalVisible.value = true;
  }

  function handleEdit(record: PaymentChannelDto) {
    isEdit.value = true;
    editingId.value = record.id;
    form.channelName = record.channelName;
    form.providerType = record.providerType;
    form.configJson = record.configJson;
    form.notifyUrl = record.notifyUrl || '';
    form.remark = record.remark || '';
    form.sort = record.sort;
    form.isEnabled = record.isEnabled;
    modalVisible.value = true;
  }

  async function handleBeforeOk() {
    const err = await formRef.value?.validate();
    if (err) return false;

    const configValues = configFormRef.value?.getValues() || {};
    const configError = validateChannelConfig(form.providerType, configValues);
    if (configError) {
      Message.error(configError);
      return false;
    }

    const configJson = buildChannelConfigJson(form.providerType, configValues);

    try {
      if (isEdit.value && editingId.value) {
        const { data } = await updatePaymentChannel(editingId.value, {
          channelName: form.channelName,
          configJson,
          notifyUrl: form.notifyUrl || undefined,
          remark: form.remark || undefined,
          sort: form.sort,
          isEnabled: form.isEnabled,
        });
        form.configJson = data.configJson;
        Message.success('更新成功');
      } else {
        const { data } = await addPaymentChannel({
          channelCode: form.channelCode,
          channelName: form.channelName,
          providerType: form.providerType,
          configJson,
          notifyUrl: form.notifyUrl || undefined,
          remark: form.remark || undefined,
          sort: form.sort,
          isEnabled: form.isEnabled,
        });
        form.configJson = data.configJson;
        Message.success('创建成功');
      }
      fetchData();
      return true;
    } catch {
      return false;
    }
  }

  async function handleDelete(id: EntityId) {
    try {
      await deletePaymentChannel(id);
      Message.success('删除成功');
      fetchData();
    } catch {
      // 拦截器已提示
    }
  }

  onMounted(fetchData);
</script>

<style scoped lang="less">
  .search-form {
    margin-bottom: 12px;
  }

  .toolbar {
    margin-bottom: 12px;
  }

  .channel-modal-form {
    :deep(.arco-divider) {
      margin: 8px 0 12px;
    }

    :deep(.arco-form-item) {
      margin-bottom: 12px;
    }
  }
</style>
