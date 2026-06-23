<template>
  <a-modal
    v-model:visible="visible"
    title="扫码支付"
    :footer="false"
    width="420px"
    unmount-on-close
    @close="handleClose"
  >
    <div class="pay-qr-wrap">
      <div class="pay-amount">¥ {{ amountYuan }}</div>
      <div class="pay-subject">{{ subject }}</div>
      <div class="pay-order-no">订单号：{{ orderNo }}</div>
      <div class="qr-box">
        <img v-if="qrImageUrl" :src="qrImageUrl" alt="payment qr" class="qr-image" />
        <a-spin v-else />
      </div>
      <div class="pay-status">
        <a-tag :color="statusColor">{{ statusLabel }}</a-tag>
      </div>
      <a-space class="pay-actions" wrap>
        <a-button :loading="syncLoading" @click="() => handleSync()">刷新状态</a-button>
      </a-space>
      <div class="pay-tip">请使用对应支付 App 扫描二维码完成支付</div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import QRCode from 'qrcode';
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
  const qrCodeUrl = ref('');
  const status = ref<PaymentOrderStatus>(PaymentOrderStatus.Paying);
  const qrImageUrl = ref('');
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
    [PaymentOrderStatus.Paying]: '待扫码',
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

  async function renderQr(url: string) {
    if (!url) {
      qrImageUrl.value = '';
      return;
    }
    try {
      qrImageUrl.value = await QRCode.toDataURL(url, { width: 220, margin: 1 });
    } catch {
      qrImageUrl.value = '';
    }
  }

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

  async function applyOrder(order: PaymentOrderDto, url?: string) {
    orderId.value = order.id;
    orderNo.value = order.orderNo;
    subject.value = order.subject;
    amountCents.value = order.amount;
    status.value = order.status;
    qrCodeUrl.value = url || order.qrCodeUrl || '';
    await renderQr(qrCodeUrl.value);
  }

  async function open(result: { order: PaymentOrderDto; qrCodeUrl: string }) {
    visible.value = true;
    await applyOrder(result.order, result.qrCodeUrl);
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
  .pay-qr-wrap {
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

  .qr-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px auto 12px;
    width: 240px;
    height: 240px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: #fff;
  }

  .qr-image {
    width: 220px;
    height: 220px;
  }

  .pay-status {
    margin-bottom: 12px;
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
