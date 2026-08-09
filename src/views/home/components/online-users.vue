<template>
  <a-card
    class="general-card"
    title="在线用户"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '12px 16px 16px' }"
  >
    <template #extra>
      <a-link @click="goMore">更多</a-link>
    </template>
    <a-spin :loading="loading" style="width: 100%">
      <a-empty v-if="!hasPermissionFlag" description="暂无权限" />
      <a-empty v-else-if="!list.length" description="当前无人在线" />
      <div v-else class="user-list">
        <div v-for="user in list" :key="user.userId" class="user-item">
          <a-avatar :size="28" class="avatar">
            {{ avatarText(user) }}
          </a-avatar>
          <div class="meta">
            <div class="name">{{ user.nickName || user.userName }}</div>
            <div class="sub">
              {{ user.connectionCount }} 台设备 ·
              {{ formatTime(user.lastActiveAt) }}
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import {
    RealtimeEvents,
    type OnlineUsersChangedPayload,
  } from '@/api/server/common/realtime';
  import {
    getOnlineUserList,
    type OnlineUserDto,
  } from '@/api/server/rbac/online-user';
  import { Permissions } from '@/constants/permissions';
  import { hasPermission } from '@/utils/permission-check';
  import { onRealtimeEvent, startRealtimeHub } from '@/utils/realtime-hub';
  import useLoading from '@/hooks/loading';

  const router = useRouter();
  const { loading, setLoading } = useLoading(true);
  const list = ref<OnlineUserDto[]>([]);
  const hasPermissionFlag = hasPermission(Permissions.System.OnlineUser.List);
  let unsubscribeOnlineUsers: (() => void) | null = null;

  const avatarText = (user: OnlineUserDto) => {
    const name = user.nickName || user.userName || '?';
    return name.slice(0, 1).toUpperCase();
  };

  const formatTime = (value?: string) =>
    value ? dayjs(value).format('HH:mm') : '-';

  const goMore = () => {
    router.push('/system/online-user');
  };

  const loadData = async () => {
    if (!hasPermissionFlag) {
      list.value = [];
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getOnlineUserList();
      list.value = (data || []).slice(0, 6);
    } catch {
      list.value = [];
    } finally {
      setLoading(false);
    }
  };

  onMounted(async () => {
    await loadData();
    if (!hasPermissionFlag) return;
    await startRealtimeHub();
    unsubscribeOnlineUsers = onRealtimeEvent(
      RealtimeEvents.OnlineUsersChanged,
      (payload) => {
        const data = payload as OnlineUsersChangedPayload;
        list.value = (data.users || []).slice(0, 6);
      }
    );
  });

  onUnmounted(() => {
    unsubscribeOnlineUsers?.();
    unsubscribeOnlineUsers = null;
  });
</script>

<style scoped lang="less">
  .user-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .user-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatar {
    background: rgb(var(--arcoblue-6));
    color: #fff;
    font-size: 12px;
  }
  .meta {
    flex: 1;
    min-width: 0;
  }
  .name {
    color: var(--color-text-1);
    font-size: 13px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    margin-top: 2px;
    color: var(--color-text-3);
    font-size: 12px;
  }
</style>
