import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export interface SendSiteMessageRequest {
  userId?: EntityId | null;
  sendToAll: boolean;
  title: string;
  subTitle?: string;
  content: string;
  type: 'message' | 'notice' | 'todo';
  messageType?: number | null;
}

export interface SendSiteMessageResult {
  successCount: number;
  failCount: number;
}

export function sendSiteMessage(req: SendSiteMessageRequest) {
  return axios.post<SendSiteMessageRequest, ApiResponse<SendSiteMessageResult>>(
    '/api/SiteMessageAdmin/send',
    req
  );
}
