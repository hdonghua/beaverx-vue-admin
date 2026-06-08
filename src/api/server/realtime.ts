export const RealtimeEvents = {
  ExportTaskChanged: 'export.task.changed',
  MessageUnreadChanged: 'message.unread.changed',
} as const;

export type RealtimeEventName =
  (typeof RealtimeEvents)[keyof typeof RealtimeEvents];

export interface RealtimeMessage<T = unknown> {
  event: string;
  data: T;
}

export interface ExportTaskChangedPayload {
  task: import('./export-task').ExportTaskDto;
  activeCount: number;
}

export interface MessageUnreadChangedPayload {
  unreadCount: number;
}
