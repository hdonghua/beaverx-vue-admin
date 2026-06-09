<template>
  <PageContainer :breadcrumb="['menu.payment', 'menu.payment.refund']">
    <a-card class="general-card" title="退款记录">
      <a-form :model="query" layout="inline" class="search-form">
        <a-form-item field="orderNo">
          <a-input v-model="query.orderNo" allow-clear placeholder="订单号" />
        </a-form-item>
        <a-form-item field="refundNo">
          <a-input v-model="query.refundNo" allow-clear placeholder="退款单号" />
        </a-form-item>
        <a-form-item field="status">
          <a-select v-model="query.status" allow-clear placeholder="退款状态">
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
        <template #totalAmount="{ record }">
          ¥ {{ (record.totalAmount / 100).toFixed(2) }}
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">
            {{ statusLabel(record.status) }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import useLoading from '@/hooks/loading';
  import {
    PaymentRefundDto,
    PaymentRefundStatus,
    queryPaymentRefundPage,
  } from '@/api/server/payment-order';

  const { loading, setLoading } = useLoading(true);
  const list = ref<PaymentRefundDto[]>([]);
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
  const query = reactive<{
    orderNo?: string;
    refundNo?: string;
    status?: PaymentRefundStatus;
  }>({});

  const statusOptions = [
    { value: PaymentRefundStatus.Pending, label: '待处理' },
    { value: PaymentRefundStatus.Processing, label: '处理中' },
    { value: PaymentRefundStatus.Success, label: '退款成功' },
    { value: PaymentRefundStatus.Failed, label: '退款失败' },
  ];

  const columns: TableColumnData[] = [
    { title: '退款单号', dataIndex: 'refundNo', width: 190 },
    { title: '订单号', dataIndex: 'orderNo', width: 190 },
    { title: '渠道', dataIndex: 'channelCode', width: 120 },
    { title: '退款金额', slotName: 'amount', width: 110 },
    { title: '原订单金额', slotName: 'totalAmount', width: 110 },
    { title: '状态', slotName: 'status', width: 100 },
    { title: '渠道退款号', dataIndex: 'channelRefundNo', width: 160, ellipsis: true },
    { title: '退款原因', dataIndex: 'reason', ellipsis: true },
    { title: '退款时间', dataIndex: 'refundTime', width: 170 },
    { title: '创建时间', dataIndex: 'creationTime', width: 170 },
  ];

  function statusLabel(status: PaymentRefundStatus) {
    return statusOptions.find((x) => x.value === status)?.label || '未知';
  }

  function statusColor(status: PaymentRefundStatus) {
    if (status === PaymentRefundStatus.Success) return 'green';
    if (status === PaymentRefundStatus.Processing) return 'arcoblue';
    if (status === PaymentRefundStatus.Failed) return 'red';
    return 'gray';
  }

  async function fetchData() {
    setLoading(true);
    try {
      const { data } = await queryPaymentRefundPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        orderNo: query.orderNo,
        refundNo: query.refundNo,
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
    query.refundNo = undefined;
    query.status = undefined;
    search();
  }

  function onPageChange(page: number) {
    pagination.current = page;
    fetchData();
  }

  onMounted(fetchData);
</script>

<style scoped lang="less">
  .search-form {
    margin-bottom: 12px;
  }
</style>
