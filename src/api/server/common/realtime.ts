export const RealtimeEvents = {
  ExportTaskChanged: 'export.task.changed',
  MessageUnreadChanged: 'message.unread.changed',
  UserDisabled: 'user.disabled',
  OnlineUsersChanged: 'online.users.changed',
  UserForceOffline: 'user.force_offline',
} as const;

export type RealtimeEventName =
  (typeof RealtimeEvents)[keyof typeof RealtimeEvents];

export interface RealtimeMessage<T = unknown> {
  event: string;
  data: T;
}

export interface ExportTaskChangedPayload {
  task: import('@/api/server/system/export-task').ExportTaskDto;
  activeCount: number;
}

export interface MessageUnreadChangedPayload {
  unreadCount: number;
}

export interface UserDisabledPayload {
  message?: string;
}

export interface OnlineUsersChangedPayload {
  users: import('@/api/server/rbac/online-user').OnlineUserDto[];
  totalConnections: number;
}

export interface UserForceOfflinePayload {
  message?: string;
}

