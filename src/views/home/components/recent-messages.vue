<template>
  <a-card
    class="general-card"
    title="最新消息"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '12px 16px 16px' }"
  >
    <template #extra>
      <a-space :size="8">
        <a-tag v-if="unreadCount" color="orangered" size="small">
          {{ unreadCount }} 未读
        </a-tag>
        <a-link @click="refresh">刷新</a-link>
      </a-space>
    </template>
    <a-spin :loading="loading" style="width: 100%">
      <a-empty v-if="!list.length" description="暂无消息" />
      <div v-else>
        <div
          v-for="item in list"
          :key="item.id"
          class="item"
          :class="{ unread: item.status === 0 }"
        >
          <a-tag v-if="item.status === 0" color="orangered" size="small">
            未读
          </a-tag>
          <a-tag v-else color="gray" size="small">已读</a-tag>
          <span class="item-content" :title="item.title">{{ item.title }}</span>
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import useMessageUnread from '@/hooks/message-unread';
  import {
    getMessageList,
    type MessageRecord,
  } from '@/api/server/message/message';

  const { loading, setLoading } = useLoading(true);
  const { unreadCount, refreshUnreadCount } = useMessageUnread();
  const list = ref<MessageRecord[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await getMessageList();
      list.value = (data || []).slice(0, 6);
      await refreshUnreadCount();
    } catch {
      list.value = [];
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadData();
  };

  loadData();
</script>

<style scoped lang="less">
  .item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 28px;
    margin-bottom: 4px;

    &.unread .item-content {
      color: var(--color-text-1);
      font-weight: 500;
    }
  }
  .item-content {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 6px;
    color: var(--color-text-2);
    font-size: 13px;
  }
</style>
