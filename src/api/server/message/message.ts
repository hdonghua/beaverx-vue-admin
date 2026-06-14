import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export interface MessageRecord {
  id: EntityId;
  type: string;
  title: string;
  subTitle: string;
  avatar?: string;
  content: string;
  time: string;
  status: 0 | 1;
  messageType?: number;
}

export type MessageListType = MessageRecord[];

/** 当前用户消息列表 */
export function getMessageList() {
  return axios.get<void, ApiResponse<MessageListType>>('/api/Message/list');
}

/** 未读消息数量 */
export function getUnreadCount() {
  return axios.get<void, ApiResponse<number>>('/api/Message/unread-count');
}

/** 批量标为已读 */
export function markMessagesRead(ids: EntityId[]) {
  return axios.put<{ ids: EntityId[] }, ApiResponse<void>>('/api/Message/read', {
    ids,
  });
}

/** 全部标为已读（可按类型筛选） */
export function markAllMessagesRead(type?: string) {
  return axios.put<{ type?: string }, ApiResponse<void>>(
    '/api/Message/read-all',
    { type }
  );
}
