<template>
  <a-modal
    v-model:visible="visible"
    title="App 支付参数"
    :footer="false"
    width="520px"
    unmount-on-close
    @close="handleClose"
  >
    <div class="pay-app-wrap">
      <div class="pay-amount">¥ {{ amountYuan }}</div>
      <div class="pay-subject">{{ subject }}</div>
      <div class="pay-order-no">订单号：{{ orderNo }}</div>
      <a-textarea
        :model-value="appPayOrderString"
        readonly
        :auto-size="{ minRows: 4, maxRows: 8 }"
        class="order-string"
      />
      <a-space class="pay-actions" wrap>
        <a-button type="primary" @click="handleCopy">复制 orderString</a-button>
        <a-button :loading="syncLoading" @click="() => handleSync()">刷新状态</a-button>
      </a-space>
      <div class="pay-status">
        <a-tag :color="statusColor">{{ statusLabel }}</a-tag>
      </div>
      <div class="pay-tip">将 orderString 交给移动端 App，由支付宝 SDK 调起支付</div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    PaymentOrderStatus,
    PaymentOrderDto,
    syncPaymentOrder,
  } from '@/api/server/payment/order';
  import type { EntityId } from '@/types/entity-id';

  const visible = ref(false);
  const orderId = ref<EntityId | undefined>();
  const orderNo = ref('');
  const subject = ref('');
  const amountCents = ref(0);
  const appPayOrderString = ref('');
  const status = ref<PaymentOrderStatus>(PaymentOrderStatus.Paying);
  const syncLoading = ref(false);
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const amountYuan = computed(() => (amountCents.value / 100).toFixed(2));
  const isPaid = computed(() =>
    [
      PaymentOrderStatus.Success,
      PaymentOrderStatus.Refunded,
      PaymentOrderStatus.PartialRefunded,
    ].includes(status.value)
  );

  const statusLabelMap: Record<number, string> = {
    [PaymentOrderStatus.Pending]: '待支付',
    [PaymentOrderStatus.Paying]: '待支付',
    [PaymentOrderStatus.Success]: '支付成功',
    [PaymentOrderStatus.Failed]: '支付失败',
    [PaymentOrderStatus.Closed]: '已关闭',
    [PaymentOrderStatus.Refunding]: '退款中',
    [PaymentOrderStatus.Refunded]: '已退款',
    [PaymentOrderStatus.PartialRefunded]: '部分退款',
  };

  const statusColorMap: Record<number, string> = {
    [PaymentOrderStatus.Pending]: 'gray',
    [PaymentOrderStatus.Paying]: 'arcoblue',
    [PaymentOrderStatus.Success]: 'green',
    [PaymentOrderStatus.Failed]: 'red',
    [PaymentOrderStatus.Closed]: 'gray',
    [PaymentOrderStatus.Refunding]: 'orange',
    [PaymentOrderStatus.Refunded]: 'purple',
    [PaymentOrderStatus.PartialRefunded]: 'purple',
  };

  const statusLabel = computed(() => statusLabelMap[status.value] || '未知');
  const statusColor = computed(() => statusColorMap[status.value] || 'gray');

  const emit = defineEmits<{ paid: [order: PaymentOrderDto]; closed: [] }>();

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPoll() {
    stopPoll();
    pollTimer = setInterval(() => {
      if (!isPaid.value && orderId.value) {
        handleSync(true);
      } else {
        stopPoll();
      }
    }, 3000);
  }

  async function applyOrder(order: PaymentOrderDto, orderString?: string) {
    orderId.value = order.id;
    orderNo.value = order.orderNo;
    subject.value = order.subject;
    amountCents.value = order.amount;
    status.value = order.status;
    appPayOrderString.value = orderString || order.appPayOrderString || '';
  }

  async function open(result: { order: PaymentOrderDto; appPayOrderString: string }) {
    visible.value = true;
    await applyOrder(result.order, result.appPayOrderString);
    if (!isPaid.value) {
      startPoll();
    }
  }

  async function handleSync(silent = false) {
    if (!orderId.value) return;
    syncLoading.value = true;
    try {
      const { data } = await syncPaymentOrder(orderId.value);
      status.value = data.status;
      if (data.status === PaymentOrderStatus.Success) {
        Message.success('支付成功');
        emit('paid', data);
        stopPoll();
      } else if (!silent && data.status === PaymentOrderStatus.Closed) {
        Message.warning('订单已关闭');
        stopPoll();
      }
    } finally {
      syncLoading.value = false;
    }
  }

  async function handleCopy() {
    if (!appPayOrderString.value) {
      Message.warning('暂无 App 支付参数');
      return;
    }
    try {
      await navigator.clipboard.writeText(appPayOrderString.value);
      Message.success('已复制 orderString');
    } catch {
      Message.error('复制失败，请手动选择文本复制');
    }
  }

  function handleClose() {
    stopPoll();
    emit('closed');
  }

  watch(visible, (val) => {
    if (!val) {
      stopPoll();
    }
  });

  defineExpose({ open });
</script>

<style scoped lang="less">
  .pay-app-wrap {
    text-align: center;
  }

  .pay-amount {
    color: var(--color-text-1);
    font-size: 28px;
    font-weight: 600;
    line-height: 36px;
  }

  .pay-subject {
    margin-top: 8px;
    color: var(--color-text-2);
    font-size: 14px;
  }

  .pay-order-no {
    margin-top: 4px;
    color: var(--color-text-3);
    font-size: 12px;
  }

  .order-string {
    margin: 16px 0 12px;
    text-align: left;
  }

  .pay-status {
    margin-top: 12px;
  }

  .pay-actions {
    justify-content: center;
  }

  .pay-tip {
    margin-top: 16px;
    color: var(--color-text-3);
    font-size: 12px;
  }
</style>
