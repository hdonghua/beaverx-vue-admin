import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';
import { PagedResultDto, QueryPageRequest } from '@/types/page';

export enum PaymentProviderType {
  Sandbox = 0,
  WeChat = 1,
  Alipay = 2,
}

export interface PaymentChannelDto {
  id: number;
  channelCode: string;
  channelName: string;
  providerType: PaymentProviderType;
  isEnabled: boolean;
  configJson: string;
  notifyUrl?: string | null;
  remark?: string | null;
  sort: number;
  creationTime: string;
}

export interface PaymentChannelQueryRequest extends QueryPageRequest {
  keyword?: string;
  isEnabled?: boolean;
}

export interface CreatePaymentChannelRequest {
  channelCode: string;
  channelName: string;
  providerType: PaymentProviderType;
  isEnabled?: boolean;
  configJson?: string;
  notifyUrl?: string;
  remark?: string;
  sort?: number;
}

export interface UpdatePaymentChannelRequest {
  channelName?: string;
  isEnabled?: boolean;
  configJson?: string;
  notifyUrl?: string;
  remark?: string;
  sort?: number;
}

export function queryPaymentChannelPage(req: PaymentChannelQueryRequest) {
  return axios.get<PaymentChannelQueryRequest, ApiResponse<PagedResultDto<PaymentChannelDto>>>(
    '/api/PaymentChannel/list',
    { params: { page: req.current, pageSize: req.pageSize, keyword: req.keyword, isEnabled: req.isEnabled } }
  );
}

export function queryEnabledPaymentChannels() {
  return axios.get<void, ApiResponse<PaymentChannelDto[]>>('/api/PaymentChannel/enabled');
}

export function getPaymentChannelById(id: number) {
  return axios.get<void, ApiResponse<PaymentChannelDto>>(`/api/PaymentChannel/${id}`);
}

export function addPaymentChannel(req: CreatePaymentChannelRequest) {
  return axios.post<CreatePaymentChannelRequest, ApiResponse<PaymentChannelDto>>(
    '/api/PaymentChannel',
    req
  );
}

export function updatePaymentChannel(id: number, req: UpdatePaymentChannelRequest) {
  return axios.put<UpdatePaymentChannelRequest, ApiResponse<PaymentChannelDto>>(
    `/api/PaymentChannel/${id}`,
    req
  );
}

export function deletePaymentChannel(id: number) {
  return axios.delete<void, ApiResponse<void>>(`/api/PaymentChannel/${id}`);
}
