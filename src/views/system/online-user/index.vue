<template>
  <PageContainer :breadcrumb="['menu.system', 'menu.system.onlineUserList']">
    <a-card class="general-card">
      <div class="online-user-summary">
        <a-statistic
          :title="$t('onlineUser.onlineCount')"
          :value="list.length"
        />
        <a-statistic
          :title="$t('onlineUser.connectionCount')"
          :value="totalConnections"
        />
        <a-button type="outline" @click="loadData">
          <template #icon><icon-refresh /></template>
          {{ $t('searchTable.actions.refresh') }}
        </a-button>
      </div>

      <a-table
        row-key="userId"
        :loading="loading"
        :columns="columns"
        :data="list"
        :pagination="false"
        :bordered="{ cell: true }"
      >
        <template #nickName="{ record }">
          {{ record.nickName || '-' }}
        </template>
        <template #connectedAt="{ record }">
          {{ formatTime(record.connectedAt) }}
        </template>
        <template #lastActiveAt="{ record }">
          {{ formatTime(record.lastActiveAt) }}
        </template>
        <template #operations="{ record }">
          <a-popconfirm
            v-if="canKick(record)"
            :content="kickConfirmText(record)"
            @ok="handleKick(record)"
          >
            <a-button
              type="text"
              size="small"
              status="danger"
              v-permission="[Permissions.System.OnlineUser.Kick]"
            >
              {{ $t('onlineUser.kick') }}
            </a-button>
          </a-popconfirm>
          <span v-else>-</span>
        </template>
      </a-table>
    </a-card>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import dayjs from 'dayjs';
  import type { TableColumnData } from '@arco-design/web-vue';
  import PageContainer from '@/components/page-container/index.vue';
  import {
    RealtimeEvents,
    type OnlineUsersChangedPayload,
  } from '@/api/server/common/realtime';
  import {
    getOnlineUserList,
    kickOnlineUser,
    type OnlineUserDto,
  } from '@/api/server/rbac/online-user';
  import { Permissions } from '@/constants/permissions';
  import useUserStore from '@/store/modules/user';
  import { onRealtimeEvent, startRealtimeHub } from '@/utils/realtime-hub';

  const { t } = useI18n();
  const userStore = useUserStore();

  const loading = ref(false);
  const list = ref<OnlineUserDto[]>([]);
  const totalConnections = ref(0);
  let unsubscribeOnlineUsers: (() => void) | null = null;

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('onlineUser.userName'),
      dataIndex: 'userName',
      width: 160,
    },
    {
      title: t('onlineUser.nickName'),
      dataIndex: 'nickName',
      slotName: 'nickName',
      width: 160,
    },
    {
      title: t('onlineUser.connectionCount'),
      dataIndex: 'connectionCount',
      width: 120,
    },
    {
      title: t('onlineUser.connectedAt'),
      dataIndex: 'connectedAt',
      slotName: 'connectedAt',
      width: 180,
    },
    {
      title: t('onlineUser.lastActiveAt'),
      dataIndex: 'lastActiveAt',
      slotName: 'lastActiveAt',
      width: 180,
    },
    {
      title: t('searchTable.columns.operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 120,
      fixed: 'right',
    },
  ]);

  const formatTime = (value?: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';

  const canKick = (record: OnlineUserDto) =>
    String(record.userId) !== userStore.accountId;

  const kickConfirmText = (record: OnlineUserDto) =>
    t('onlineUser.kickConfirm', {
      name: record.nickName || record.userName,
    });

  const applyPayload = (payload?: OnlineUsersChangedPayload | null) => {
    if (!payload) {
      return;
    }
    list.value = payload.users || [];
    totalConnections.value = payload.totalConnections || 0;
  };

  const loadData = async () => {
    loading.value = true;
    try {
      const { data } = await getOnlineUserList();
      list.value = data || [];
      totalConnections.value = (data || []).reduce(
        (sum, item) => sum + item.connectionCount,
        0
      );
    } finally {
      loading.value = false;
    }
  };

  const handleKick = async (record: OnlineUserDto) => {
    try {
      await kickOnlineUser(record.userId);
      Message.success(t('onlineUser.kickSuccess'));
    } catch {
      // 错误提示由 axios 拦截器统一处理
    }
  };

  onMounted(async () => {
    await loadData();
    await startRealtimeHub();
    unsubscribeOnlineUsers = onRealtimeEvent(
      RealtimeEvents.OnlineUsersChanged,
      (data) => {
        applyPayload((data || {}) as OnlineUsersChangedPayload);
      }
    );
  });

  onUnmounted(() => {
    unsubscribeOnlineUsers?.();
    unsubscribeOnlineUsers = null;
  });
</script>

<script lang="ts">
  export default {
    name: 'OnlineUserList',
  };
</script>

<style scoped lang="less">
  .online-user-summary {
    display: flex;
    align-items: flex-end;
    gap: 32px;
    margin-bottom: 16px;
  }
</style>
