<template>
  <a-list :bordered="false" :max-height="320" class="message-list">
    <a-list-item
      v-for="item in renderList"
      :key="item.id"
      action-layout="vertical"
      :class="['message-item', { 'is-read': item.status }]"
    >
      <template #extra>
        <a-tag v-if="item.messageType === 1" color="green" size="small">已开通</a-tag>
        <a-tag v-else-if="item.messageType === 2" color="blue" size="small">进行中</a-tag>
        <a-tag v-else-if="item.messageType === 3" color="red" size="small">即将到期</a-tag>
      </template>
      <div class="item-wrap" @click="onItemClick(item)">
        <span v-if="!item.status" class="unread-dot" />
        <a-list-item-meta>
          <template v-if="item.avatar" #avatar>
            <a-avatar :size="36" shape="circle">
              <img :src="item.avatar" alt="" />
            </a-avatar>
          </template>
          <template #title>
            <div class="item-title">
              <span class="item-title-text">{{ item.title }}</span>
              <span v-if="item.subTitle" class="item-subtitle">{{
                item.subTitle
              }}</span>
            </div>
          </template>
          <template #description>
            <p class="item-content">{{ item.content }}</p>
            <span class="item-time">{{ item.time }}</span>
          </template>
        </a-list-item-meta>
      </div>
    </a-list-item>
    <!-- <template v-if="renderList.length && hasUnread" #footer>
      <div class="footer-wrap">
        <a-link @click="allRead">{{ $t('messageBox.allRead') }}</a-link>
      </div>
    </template> -->
  </a-list>
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';
  import { MessageRecord, MessageListType } from '@/api/server/message';

  const props = defineProps({
    renderList: {
      type: Array as PropType<MessageListType>,
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  });
  const emit = defineEmits(['itemClick']);

  const hasUnread = computed(() =>
    props.renderList.some((item) => !item.status)
  );

  const allRead = () => {
    const unreadItems = props.renderList.filter((item) => !item.status);
    if (unreadItems.length) {
      emit('itemClick', unreadItems);
    }
  };

  const onItemClick = (item: MessageRecord) => {
    if (!item.status) {
      emit('itemClick', [item]);
    }
  };
</script>

<style scoped lang="less">
  .message-list {
    :deep(.arco-list) {
      .arco-list-item {
        padding: 0;
        border-bottom: 1px solid var(--color-border-2);

        &:last-child {
          border-bottom: none;
        }
      }

      .arco-list-item-extra {
        position: absolute;
        top: 14px;
        right: 16px;
      }

      .arco-list-item-meta {
        align-items: flex-start;
        padding: 0;
      }

      .arco-list-item-meta-avatar {
        margin-right: 12px;
      }

      .arco-list-item-meta-content {
        flex: 1;
        min-width: 0;
      }

      .arco-list-footer {
        padding: 0;
        border-top: 1px solid var(--color-border-2);
      }
    }
  }

  .message-item {
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-fill-1);
    }

    &.is-read {
      .item-title-text,
      .item-content {
        color: var(--color-text-3);
      }

      .item-subtitle,
      .item-time {
        color: var(--color-text-4);
      }
    }
  }

  .item-wrap {
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding: 12px 16px 12px 20px;
    cursor: pointer;
  }

  .unread-dot {
    position: absolute;
    top: 20px;
    left: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgb(var(--primary-6));
  }

  .item-title {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    line-height: 22px;
  }

  .item-title-text {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-1);
  }

  .item-subtitle {
    overflow: hidden;
    font-size: 13px;
    color: var(--color-text-3);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-content {
    margin: 4px 0 0;
    overflow: hidden;
    font-size: 13px;
    line-height: 20px;
    color: var(--color-text-2);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-time {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 18px;
    color: var(--color-text-4);
  }

  .footer-wrap {
    height: 44px;
    line-height: 44px;
    text-align: center;

    :deep(.arco-link) {
      font-size: 13px;
    }
  }
</style>
