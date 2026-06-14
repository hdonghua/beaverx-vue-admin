export const RealtimeEvents = {
  ExportTaskChanged: 'export.task.changed',
  MessageUnreadChanged: 'message.unread.changed',
  UserDisabled: 'user.disabled',
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
