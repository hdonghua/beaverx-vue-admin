<template>
  <PageContainer :breadcrumb="['menu.payment', 'menu.payment.order']">
    <a-card class="general-card" title="支付订单">
      <a-form :model="query" layout="inline" class="search-form">
        <a-form-item field="orderNo">
          <a-input v-model="query.orderNo" allow-clear placeholder="订单号" />
        </a-form-item>
        <a-form-item field="channelCode">
          <a-select
            v-model="query.channelCode"
            allow-clear
            placeholder="支付渠道"
            :loading="channelLoading"
          >
            <a-option
              v-for="item in channelList"
              :key="item.channelCode"
              :value="item.channelCode"
            >
              {{ item.channelName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status">
          <a-select v-model="query.status" allow-clear placeholder="订单状态">
            <a-option
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
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
        <a-button v-if="canCreate" type="primary" @click="openCreateModal">
          <template #icon><icon-plus /></template>
          创建扫码支付
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
        <template #amount="{ record }">
          ¥ {{ (record.amount / 100).toFixed(2) }}
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">
            {{ statusLabel(record.status) }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button
              v-if="canShowQr(record)"
              type="text"
              size="small"
              @click="showQr(record)"
            >
              二维码
            </a-button>
            <a-button
              v-if="canQuery"
              type="text"
              size="small"
              @click="handleSync(record.id)"
            >
              同步
            </a-button>
            <a-button
              v-if="canClose(record) && canCloseOrder"
              type="text"
              size="small"
              @click="handleClose(record.id)"
            >
              关闭
            </a-button>
            <a-button
              v-if="canRefund(record) && canRefundOrder"
              type="text"
              size="small"
              @click="openRefundModal(record)"
            >
              退款
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="createVisible"
      title="创建扫码支付订单"
      unmount-on-close
      :ok-loading="createSubmitting"
      @before-ok="handleCreate"
    >
      <a-form ref="createFormRef" layout="vertical" :model="createForm">
        <a-form-item
          field="channelCode"
          label="支付渠道"
          :rules="[{ required: true, message: '请选择支付渠道' }]"
        >
          <a-select v-model="createForm.channelCode" placeholder="请选择">
            <a-option
              v-for="item in enabledChannels"
              :key="item.channelCode"
              :value="item.channelCode"
            >
              {{ item.channelName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-alert
          v-if="!enabledChannels.length"
          type="warning"
          show-icon
          class="channel-tip"
        >
          暂无可用支付渠道，请先在「支付渠道」中启用渠道。
        </a-alert>
        <a-form-item
          field="subject"
          label="订单标题"
          :rules="[{ required: true, message: '请输入订单标题' }]"
        >
          <a-input v-model="createForm.subject" />
        </a-form-item>
        <a-form-item field="description" label="订单描述">
          <a-input v-model="createForm.description" />
        </a-form-item>
        <a-form-item
          field="amountYuan"
          label="支付金额（元）"
          :rules="[{ required: true, message: '请输入金额' }]"
        >
          <a-input-number v-model="createForm.amountYuan" :min="0.01" :precision="2" />
        </a-form-item>
        <a-form-item field="expireMinutes" label="过期时间（分钟）">
          <a-input-number v-model="createForm.expireMinutes" :min="5" :max="120" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="refundVisible"
      title="发起退款"
      unmount-on-close
      :ok-loading="refundSubmitting"
      @before-ok="handleRefund"
    >
      <a-form layout="vertical" :model="refundForm">
        <a-form-item label="订单号">
          <a-input :model-value="refundForm.orderNo" disabled />
        </a-form-item>
        <a-form-item label="可退金额（元）">
          <a-input :model-value="refundForm.refundableYuan" disabled />
        </a-form-item>
        <a-form-item field="amountYuan" label="退款金额（元）">
          <a-input-number v-model="refundForm.amountYuan" :min="0.01" :precision="2" />
        </a-form-item>
        <a-form-item field="reason" label="退款原因">
          <a-input v-model="refundForm.reason" />
        </a-form-item>
      </a-form>
    </a-modal>

    <PaymentQrModal ref="qrModalRef" @paid="fetchData" />
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import type { FormInstance } from '@arco-design/web-vue/es/form';
  import useLoading from '@/hooks/loading';
  import usePermission from '@/hooks/permission';
  import { Permissions } from '@/constants/permissions';
  import PaymentQrModal from '@/components/payment-qr-modal/index.vue';
  import {
    PaymentChannelDto,
    queryEnabledPaymentChannels,
  } from '@/api/server/payment-channel';
  import {
    PaymentOrderDto,
    PaymentOrderStatus,
    createNativePaymentOrder,
    queryPaymentOrderPage,
    syncPaymentOrder,
    closePaymentOrder,
    refundPaymentOrder,
  } from '@/api/server/payment-order';

  const { hasPermission } = usePermission();
  const canCreate = computed(() => hasPermission(Permissions.Payment.Order.Create));
  const canQuery = computed(() => hasPermission(Permissions.Payment.Order.Query));
  const canCloseOrder = computed(() => hasPermission(Permissions.Payment.Order.Close));
  const canRefundOrder = computed(() => hasPermission(Permissions.Payment.Order.Refund));

  const { loading, setLoading } = useLoading(true);
  const channelLoading = ref(false);
  const channelList = ref<PaymentChannelDto[]>([]);
  const enabledChannels = computed(() => channelList.value.filter((x) => x.isEnabled));
  const list = ref<PaymentOrderDto[]>([]);
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
  const query = reactive<{
    orderNo?: string;
    channelCode?: string;
    status?: PaymentOrderStatus;
  }>({});

  const createVisible = ref(false);
  const createSubmitting = ref(false);
  const createFormRef = ref<FormInstance>();
  const createForm = reactive({
    channelCode: '',
    subject: '',
    description: '',
    amountYuan: 0.01,
    expireMinutes: 30,
  });

  const refundVisible = ref(false);
  const refundSubmitting = ref(false);
  const refundForm = reactive({
    paymentOrderId: 0,
    orderNo: '',
    refundableYuan: '0.00',
    amountYuan: 0.01,
    reason: '',
  });

  const qrModalRef = ref<InstanceType<typeof PaymentQrModal>>();

  const statusOptions = [
    { value: PaymentOrderStatus.Pending, label: '待支付' },
    { value: PaymentOrderStatus.Paying, label: '待扫码' },
    { value: PaymentOrderStatus.Success, label: '支付成功' },
    { value: PaymentOrderStatus.Failed, label: '支付失败' },
    { value: PaymentOrderStatus.Closed, label: '已关闭' },
    { value: PaymentOrderStatus.Refunding, label: '退款中' },
    { value: PaymentOrderStatus.Refunded, label: '已退款' },
    { value: PaymentOrderStatus.PartialRefunded, label: '部分退款' },
  ];

  const columns: TableColumnData[] = [
    { title: '订单号', dataIndex: 'orderNo', width: 180 },
    { title: '渠道', dataIndex: 'channelCode', width: 120 },
    { title: '标题', dataIndex: 'subject', ellipsis: true },
    { title: '金额', slotName: 'amount', width: 100 },
    { title: '状态', slotName: 'status', width: 110 },
    { title: '渠道单号', dataIndex: 'channelOrderNo', width: 160, ellipsis: true },
    { title: '创建时间', dataIndex: 'creationTime', width: 170 },
    { title: '操作', slotName: 'operations', width: 220, fixed: 'right' },
  ];

  function statusLabel(status: PaymentOrderStatus) {
    return statusOptions.find((x) => x.value === status)?.label || '未知';
  }

  function statusColor(status: PaymentOrderStatus) {
    const map: Record<number, string> = {
      [PaymentOrderStatus.Paying]: 'arcoblue',
      [PaymentOrderStatus.Success]: 'green',
      [PaymentOrderStatus.Failed]: 'red',
      [PaymentOrderStatus.Closed]: 'gray',
      [PaymentOrderStatus.Refunding]: 'orange',
      [PaymentOrderStatus.Refunded]: 'purple',
      [PaymentOrderStatus.PartialRefunded]: 'purple',
    };
    return map[status] || 'gray';
  }

  function canShowQr(record: PaymentOrderDto) {
    return record.status === PaymentOrderStatus.Paying && record.qrCodeUrl;
  }

  function canClose(record: PaymentOrderDto) {
    return [PaymentOrderStatus.Pending, PaymentOrderStatus.Paying].includes(record.status);
  }

  function canRefund(record: PaymentOrderDto) {
    return [PaymentOrderStatus.Success, PaymentOrderStatus.PartialRefunded].includes(
      record.status
    );
  }

  async function loadChannels() {
    channelLoading.value = true;
    try {
      const { data } = await queryEnabledPaymentChannels();
      channelList.value = data;
    } catch {
      channelList.value = [];
    } finally {
      channelLoading.value = false;
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const { data } = await queryPaymentOrderPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        orderNo: query.orderNo,
        channelCode: query.channelCode,
        status: query.status,
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
    query.orderNo = undefined;
    query.channelCode = undefined;
    query.status = undefined;
    search();
  }

  function onPageChange(page: number) {
    pagination.current = page;
    fetchData();
  }

  function openCreateModal() {
    if (!enabledChannels.value.length) {
      Message.warning('暂无可用支付渠道，请先启用支付渠道');
      return;
    }
    createForm.channelCode = enabledChannels.value[0]?.channelCode || '';
    createForm.subject = '';
    createForm.description = '';
    createForm.amountYuan = 0.01;
    createForm.expireMinutes = 30;
    createVisible.value = true;
  }

  async function handleCreate() {
    const err = await createFormRef.value?.validate();
    if (err) return false;
    if (!enabledChannels.value.length) {
      Message.warning('暂无可用支付渠道');
      return false;
    }
    createSubmitting.value = true;
    try {
      const { data } = await createNativePaymentOrder({
        channelCode: createForm.channelCode,
        subject: createForm.subject,
        description: createForm.description || undefined,
        amount: Math.round(createForm.amountYuan * 100),
        expireMinutes: createForm.expireMinutes,
      });
      Message.success('订单创建成功');
      await fetchData();
      qrModalRef.value?.open(data);
      return true;
    } catch {
      return false;
    } finally {
      createSubmitting.value = false;
    }
  }

  function showQr(record: PaymentOrderDto) {
    if (!record.qrCodeUrl) {
      Message.warning('该订单暂无二维码');
      return;
    }
    qrModalRef.value?.open({ order: record, qrCodeUrl: record.qrCodeUrl });
  }

  async function handleSync(id: number) {
    try {
      await syncPaymentOrder(id);
      Message.success('同步完成');
      fetchData();
    } catch {
      // 拦截器已提示
    }
  }

  async function handleClose(id: number) {
    try {
      await closePaymentOrder(id);
      Message.success('订单已关闭');
      fetchData();
    } catch {
      // 拦截器已提示
    }
  }

  function openRefundModal(record: PaymentOrderDto) {
    const refundable = record.amount - record.refundedAmount;
    refundForm.paymentOrderId = record.id;
    refundForm.orderNo = record.orderNo;
    refundForm.refundableYuan = (refundable / 100).toFixed(2);
    refundForm.amountYuan = refundable / 100;
    refundForm.reason = '';
    refundVisible.value = true;
  }

  async function handleRefund() {
    refundSubmitting.value = true;
    try {
      await refundPaymentOrder({
        paymentOrderId: refundForm.paymentOrderId,
        amount: Math.round(refundForm.amountYuan * 100),
        reason: refundForm.reason || undefined,
      });
      Message.success('退款已提交');
      fetchData();
      return true;
    } catch {
      return false;
    } finally {
      refundSubmitting.value = false;
    }
  }

  onMounted(async () => {
    await loadChannels();
    fetchData();
  });
</script>

<style scoped lang="less">
  .search-form {
    margin-bottom: 12px;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .channel-tip {
    margin-bottom: 12px;
  }
</style>
