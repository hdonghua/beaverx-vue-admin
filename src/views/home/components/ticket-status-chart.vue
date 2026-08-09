<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '20px' }"
      title="我的工单状态"
    >
      <template #extra>
        <a-link @click="goMore">查看工单</a-link>
      </template>
      <Chart height="310px" :options="chartOption" />
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import useChartOption from '@/hooks/chart-option';
  import { Permissions } from '@/constants/permissions';
  import { hasPermission } from '@/utils/permission-check';
  import {
    queryWorkTicketPage,
    WorkTicketStatus,
  } from '@/api/server/ticket/work-ticket';

  const router = useRouter();
  const { loading, setLoading } = useLoading(true);

  const statusLabels = ['待处理', '处理中', '已解决', '已关闭'];
  const statusValues = ref([0, 0, 0, 0]);
  const total = ref(0);

  const { chartOption } = useChartOption((isDark) => ({
    legend: {
      left: 'center',
      data: statusLabels,
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      textStyle: {
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4E5969',
      },
      itemStyle: { borderWidth: 0 },
    },
    tooltip: {
      show: true,
      trigger: 'item',
    },
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: '40%',
          style: {
            text: '工单数',
            textAlign: 'center',
            fill: isDark ? '#ffffffb3' : '#4E5969',
            fontSize: 14,
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '50%',
          style: {
            text: String(total.value),
            textAlign: 'center',
            fill: isDark ? '#ffffffb3' : '#1D2129',
            fontSize: 16,
            fontWeight: 500,
          },
        },
      ],
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        label: {
          formatter: '{d}%',
          fontSize: 14,
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4E5969',
        },
        itemStyle: {
          borderColor: isDark ? '#232324' : '#fff',
          borderWidth: 1,
        },
        data: [
          {
            value: statusValues.value[0],
            name: statusLabels[0],
            itemStyle: { color: isDark ? '#FF9A2E' : '#FF7D00' },
          },
          {
            value: statusValues.value[1],
            name: statusLabels[1],
            itemStyle: { color: isDark ? '#3D72F6' : '#165DFF' },
          },
          {
            value: statusValues.value[2],
            name: statusLabels[2],
            itemStyle: { color: isDark ? '#23C343' : '#00B42A' },
          },
          {
            value: statusValues.value[3],
            name: statusLabels[3],
            itemStyle: { color: isDark ? '#86909C' : '#C9CDD4' },
          },
        ],
      },
    ],
  }));

  const fetchStatusTotal = async (status: WorkTicketStatus) => {
    try {
      const { data } = await queryWorkTicketPage({
        current: 1,
        pageSize: 1,
        status,
      });
      return data?.total || 0;
    } catch {
      return 0;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!hasPermission(Permissions.Ticket.Work.List)) {
        statusValues.value = [0, 0, 0, 0];
        total.value = 0;
        return;
      }
      const counts = await Promise.all([
        fetchStatusTotal(WorkTicketStatus.Pending),
        fetchStatusTotal(WorkTicketStatus.Processing),
        fetchStatusTotal(WorkTicketStatus.Resolved),
        fetchStatusTotal(WorkTicketStatus.Closed),
      ]);
      statusValues.value = counts;
      total.value = counts.reduce((sum, n) => sum + n, 0);
    } finally {
      setLoading(false);
    }
  };

  const goMore = () => {
    router.push('/ticket/work');
  };

  loadData();
</script>

<style scoped lang="less">
  .general-card {
    min-height: 395px;
  }
</style>
