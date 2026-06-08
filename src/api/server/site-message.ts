import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';

export interface SendSiteMessageRequest {
  userId?: number | null;
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
