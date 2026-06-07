export type {
  MessageRecord,
  MessageListType,
} from '@/api/server/message';

import {
  getMessageList,
  markMessagesRead,
  markAllMessagesRead,
  getUnreadCount,
} from '@/api/server/message';

export { markAllMessagesRead, getUnreadCount };

export function queryMessageList() {
  return getMessageList();
}

export function setMessageStatus(data: { ids: number[] }) {
  return markMessagesRead(data.ids);
}

import axios from 'axios';

export interface ChatRecord {
  id: number;
  username: string;
  content: string;
  time: string;
  isCollect: boolean;
}

export function queryChatList() {
  return axios.post<ChatRecord[]>('/api/chat/list');
}
