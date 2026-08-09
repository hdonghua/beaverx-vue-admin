<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: 0 }"
      :body-style="{ paddingTop: '20px' }"
      title="审批概况"
    >
      <template #extra>
        <a-link @click="goPending">查看待办</a-link>
      </template>
      <Chart height="280px" :options="chartOption" />
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
    queryPendingMyApprovalTasks,
    queryMyApplyFlowInstances,
    queryCcMimeFlowInstanceAsync,
    queryMimeAuditFlowInstance,
  } from '@/api/server/workflow/flow';
  import { STATUS } from '@/components/flow/common/FlowConstant';

  const router = useRouter();
  const { loading, setLoading } = useLoading(true);
  const categories = ['待办审批', '我的申请中', '抄送我的', '我已审批'];
  const values = ref([0, 0, 0, 0]);

  const { chartOption } = useChartOption((isDark) => ({
    grid: {
      left: 16,
      right: 24,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        color: isDark ? 'rgba(255,255,255,0.7)' : '#4E5969',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: isDark ? 'rgba(255,255,255,0.7)' : '#4E5969',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: isDark ? '#484849' : '#E5E8EF',
        },
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        data: values.value.map((value, idx) => ({
          value,
          itemStyle: {
            color: ['#165DFF', '#FF7D00', '#0FC6C2', '#722ED1'][idx],
            borderRadius: [4, 4, 0, 0],
          },
        })),
      },
    ],
  }));

  const fetchTotal = async (
    fn: () => Promise<{ data?: { total?: number } }>
  ) => {
    try {
      const { data } = await fn();
      return data?.total || 0;
    } catch {
      return 0;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!hasPermission(Permissions.Oa.Approval)) {
        values.value = [0, 0, 0, 0];
        return;
      }
      const [pending, underway, cc, audited] = await Promise.all([
        fetchTotal(() =>
          queryPendingMyApprovalTasks({ current: 1, pageSize: 1 })
        ),
        fetchTotal(() =>
          queryMyApplyFlowInstances({
            current: 1,
            pageSize: 1,
            status: STATUS.UNDERWAY,
          } as any)
        ),
        fetchTotal(() =>
          queryCcMimeFlowInstanceAsync({ current: 1, pageSize: 1 })
        ),
        fetchTotal(() =>
          queryMimeAuditFlowInstance({ current: 1, pageSize: 1 })
        ),
      ]);
      values.value = [pending, underway, cc, audited];
    } finally {
      setLoading(false);
    }
  };

  const goPending = () => {
    router.push('/approval/pending');
  };

  loadData();
</script>
