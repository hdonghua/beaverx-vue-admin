<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '17px 20px 21px 20px' }"
      title="待办审批"
    >
      <template #extra>
        <a-link @click="goMore">查看更多</a-link>
      </template>
      <a-table
        :data="list"
        :pagination="false"
        :bordered="false"
        :scroll="{ x: '100%', y: '280px' }"
      >
        <template #columns>
          <a-table-column title="流程" data-index="name" :ellipsis="true" />
          <a-table-column title="单号" data-index="instanceNo" :width="140" />
          <a-table-column title="发起时间" data-index="beginTime" :width="170">
            <template #cell="{ record }">
              {{ formatTime(record.beginTime) }}
            </template>
          </a-table-column>
        </template>
        <template #empty>
          <a-empty description="暂无待办" />
        </template>
      </a-table>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import { formatUtcDateTime } from '@/utils/date';
  import { Permissions } from '@/constants/permissions';
  import { hasPermission } from '@/utils/permission-check';
  import {
    queryPendingMyApprovalTasks,
    type QuerypendingMyApprovalTaskResponse,
  } from '@/api/server/workflow/flow';

  const router = useRouter();
  const { loading, setLoading } = useLoading(true);
  const list = ref<QuerypendingMyApprovalTaskResponse[]>([]);

  const formatTime = (value?: string) => formatUtcDateTime(value);

  const goMore = () => {
    router.push('/approval/pending');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!hasPermission(Permissions.Oa.Approval)) {
        list.value = [];
        return;
      }
      const { data } = await queryPendingMyApprovalTasks({
        current: 1,
        pageSize: 8,
      });
      list.value = data?.items || [];
    } catch {
      list.value = [];
    } finally {
      setLoading(false);
    }
  };

  loadData();
</script>

<style scoped lang="less">
  .general-card {
    min-height: 395px;
  }
  :deep(.arco-table-tr) {
    height: 44px;
  }
</style>
