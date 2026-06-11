<template>
  <a-spin style="display: block" :loading="loading">
    <a-tabs v-model:activeKey="messageType" destroy-on-hide>
      <a-tab-pane v-for="item in tabList" :key="item.key">
        <template #title>
          <span> {{ item.title }}{{ formatUnreadLength(item.key) }} </span>
        </template>
        <List
          :render-list="renderList"
          :unread-count="unreadCount"
          @item-click="handleItemClick"
        />
      </a-tab-pane>
      <template #extra>
        <a-button type="text" @click="emptyList" v-if="unreadCount > 0">
          {{ $t('messageBox.tab.button') }}
        </a-button>
      </template>
    </a-tabs>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs, computed, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    getMessageList,
    markMessagesRead,
    markAllMessagesRead,
    MessageRecord,
    MessageListType,
  } from '@/api/server/message';
  import useLoading from '@/hooks/loading';
  import useMessageUnread from '@/hooks/message-unread';
  import { RealtimeEvents } from '@/api/server/realtime';
  import { onRealtimeEvent } from '@/utils/realtime-hub';
  import List from './list.vue';

  interface TabItem {
    key: string;
    title: string;
    avatar?: string;
  }
  const { loading, setLoading } = useLoading(true);
  const { refreshUnreadCount } = useMessageUnread();
  const messageType = ref('notice');
  const { t } = useI18n();
  const messageData = reactive<{
    renderList: MessageRecord[];
    messageList: MessageRecord[];
  }>({
    renderList: [],
    messageList: [],
  });
  toRefs(messageData);
  const tabList: TabItem[] = [
    // {
    //   key: 'message',
    //   title: t('messageBox.tab.title.message'),
    // },
    {
      key: 'notice',
      title: t('messageBox.tab.title.notice'),
    },
  ];
  async function fetchSourceData() {
    setLoading(true);
    try {
      const { data } = await getMessageList();
      messageData.messageList = data;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  }
  async function readMessage(data: MessageListType) {
    const ids = data.map((item) => item.id);
    await markMessagesRead(ids);
    await fetchSourceData();
    await refreshUnreadCount();
  }
  const renderList = computed(() => {
    return messageData.messageList.filter(
      (item) => messageType.value === item.type
    );
  });
  const unreadCount = computed(() => {
    return renderList.value.filter((item) => !item.status).length;
  });
  const getUnreadList = (type: string) => {
    const list = messageData.messageList.filter(
      (item) => item.type === type && !item.status
    );
    return list;
  };
  const formatUnreadLength = (type: string) => {
    const list = getUnreadList(type);
    return list.length ? `(${list.length})` : ``;
  };
  const handleItemClick = (items: MessageListType) => {
    if (renderList.value.length) readMessage([...items]);
  };
  const emptyList = async () => {
    await markAllMessagesRead(messageType.value);
    await fetchSourceData();
    await refreshUnreadCount();
  };
  let unsubscribeRealtime: (() => void) | null = null;

  onMounted(() => {
    unsubscribeRealtime = onRealtimeEvent(
      RealtimeEvents.MessageUnreadChanged,
      () => {
        void fetchSourceData();
      }
    );
    void fetchSourceData();
  });

  onUnmounted(() => {
    unsubscribeRealtime?.();
  });
</script>

<style scoped lang="less">
  :deep(.arco-popover-popup-content) {
    padding: 0;
  }

  :deep(.arco-tabs-nav) {
    padding: 12px 12px 0;
    border-bottom: 1px solid var(--color-border-2);

    &::before {
      display: none;
    }
  }

  :deep(.arco-tabs-nav-tab) {
    margin-right: 4px;
  }

  :deep(.arco-tabs-nav-extra) {
    padding-right: 4px;

    .arco-btn-text {
      color: rgb(var(--primary-6));
      font-size: 13px;
    }
  }

  :deep(.arco-tabs-content) {
    padding-top: 0;
  }

  .message-empty {
    padding: 48px 0;
  }
</style>
