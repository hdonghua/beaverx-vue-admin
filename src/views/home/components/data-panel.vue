<template>
  <a-grid :cols="24" :row-gap="16" class="panel">
    <a-grid-item
      v-for="item in stats"
      :key="item.key"
      class="panel-col"
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      @click="go(item.path)"
    >
      <a-space>
        <a-avatar :size="54" class="col-avatar" :style="{ background: item.bg }">
          <component :is="item.icon" :size="28" :style="{ color: item.color }" />
        </a-avatar>
        <a-statistic
          :title="item.title"
          :value="item.value"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">{{ item.unit }}</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item :span="24">
      <a-divider class="panel-border" />
    </a-grid-item>
  </a-grid>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    RealtimeEvents,
    type OnlineUsersChangedPayload,
  } from '@/api/server/common/realtime';
  import { getOnlineUserList } from '@/api/server/rbac/online-user';
  import { queryPendingMyApprovalTasks } from '@/api/server/workflow/flow';
  import {
    queryWorkTicketProcessPage,
    WorkTicketStatus,
  } from '@/api/server/ticket/work-ticket';
  import { Permissions } from '@/constants/permissions';
  import useMessageUnread from '@/hooks/message-unread';
  import { hasPermission } from '@/utils/permission-check';
  import { onRealtimeEvent, startRealtimeHub } from '@/utils/realtime-hub';

  const router = useRouter();
  const { unreadCount } = useMessageUnread();

  const onlineUsers = ref(0);
  const pendingApprovals = ref(0);
  const pendingTickets = ref(0);
  let unsubscribeOnlineUsers: (() => void) | null = null;

  const stats = computed(() => [
    {
      key: 'online',
      title: '在线用户',
      value: onlineUsers.value,
      unit: '人',
      path: '/system/online-user',
      icon: 'icon-user-group',
      color: 'rgb(var(--arcoblue-6))',
      bg: 'rgb(var(--arcoblue-1))',
    },
    {
      key: 'pending',
      title: '待办审批',
      value: pendingApprovals.value,
      unit: '件',
      path: '/approval/pending',
      icon: 'icon-check-circle',
      color: 'rgb(var(--orangered-6))',
      bg: 'rgb(var(--orangered-1))',
    },
    {
      key: 'unread',
      title: '未读消息',
      value: unreadCount.value,
      unit: '条',
      path: '',
      icon: 'icon-notification',
      color: 'rgb(var(--green-6))',
      bg: 'rgb(var(--green-1))',
    },
    {
      key: 'ticket',
      title: '待处理工单',
      value: pendingTickets.value,
      unit: '单',
      path: '/ticket/process',
      icon: 'icon-customer-service',
      color: 'rgb(var(--purple-6))',
      bg: 'rgb(var(--purple-1))',
    },
  ]);

  const go = (path: string) => {
    if (!path) return;
    router.push(path);
  };

  const loadOnlineUsers = async () => {
    if (!hasPermission(Permissions.System.OnlineUser.List)) {
      onlineUsers.value = 0;
      return;
    }
    try {
      const { data } = await getOnlineUserList();
      onlineUsers.value = data?.length || 0;
    } catch {
      onlineUsers.value = 0;
    }
  };

  const loadPendingApprovals = async () => {
    if (!hasPermission(Permissions.Oa.Approval)) {
      pendingApprovals.value = 0;
      return;
    }
    try {
      const { data } = await queryPendingMyApprovalTasks({
        current: 1,
        pageSize: 1,
      });
      pendingApprovals.value = data?.total || 0;
    } catch {
      pendingApprovals.value = 0;
    }
  };

  const loadPendingTickets = async () => {
    if (!hasPermission(Permissions.Ticket.Work.Process)) {
      pendingTickets.value = 0;
      return;
    }
    try {
      const { data } = await queryWorkTicketProcessPage({
        current: 1,
        pageSize: 1,
        status: WorkTicketStatus.Pending,
      });
      pendingTickets.value = data?.total || 0;
    } catch {
      pendingTickets.value = 0;
    }
  };

  onMounted(async () => {
    await Promise.all([
      loadOnlineUsers(),
      loadPendingApprovals(),
      loadPendingTickets(),
    ]);

    if (hasPermission(Permissions.System.OnlineUser.List)) {
      await startRealtimeHub();
      unsubscribeOnlineUsers = onRealtimeEvent(
        RealtimeEvents.OnlineUsersChanged,
        (payload) => {
          const data = payload as OnlineUsersChangedPayload;
          onlineUsers.value = data.users?.length || 0;
        }
      );
    }
  });

  onUnmounted(() => {
    unsubscribeOnlineUsers?.();
    unsubscribeOnlineUsers = null;
  });
</script>

<style lang="less" scoped>
  .arco-grid.panel {
    margin-bottom: 0;
    padding: 16px 20px 0 20px;
  }
  .panel-col {
    padding-left: 24px;
    border-right: 1px solid rgb(var(--gray-2));
    cursor: pointer;

    &:nth-child(4n) {
      border-right: none;
    }

    &:hover {
      :deep(.arco-statistic-value) {
        color: rgb(var(--arcoblue-6));
      }
    }
  }
  .col-avatar {
    margin-right: 12px;
  }
  .unit {
    margin-left: 8px;
    color: rgb(var(--gray-8));
    font-size: 12px;
  }
  :deep(.panel-border) {
    margin: 4px 0 0 0;
  }
</style>
