import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { PagedResultDto, QueryPageRequest } from '@/types/page';

export enum PaymentOrderStatus {
  Pending = 0,
  Paying = 1,
  Success = 2,
  Failed = 3,
  Closed = 4,
  Refunding = 5,
  Refunded = 6,
  PartialRefunded = 7,
}

export enum PaymentRefundStatus {
  Pending = 0,
  Processing = 1,
  Success = 2,
  Failed = 3,
}

export interface PaymentOrderDto {
  id: EntityId;
  orderNo: string;
  channelCode: string;
  subject: string;
  description?: string | null;
  amount: number;
  currency: string;
  status: PaymentOrderStatus;
  attach?: string | null;
  businessType?: string | null;
  businessId?: string | null;
  userId?: EntityId | null;
  expireTime?: string | null;
  paidTime?: string | null;
  channelOrderNo?: string | null;
  qrCodeUrl?: string | null;
  appPayOrderString?: string | null;
  refundedAmount: number;
  errorMessage?: string | null;
  creationTime: string;
}

export interface PaymentOrderQueryRequest extends QueryPageRequest {
  orderNo?: string;
  channelCode?: string;
  status?: PaymentOrderStatus;
  startTime?: string;
  endTime?: string;
}

export interface CreatePaymentOrderRequest {
  channelCode: string;
  subject: string;
  description?: string;
  amount: number;
  attach?: string;
  businessType?: string;
  businessId?: string;
  expireMinutes?: number;
}

export interface CreatePaymentOrderResult {
  order: PaymentOrderDto;
  qrCodeUrl?: string | null;
  appPayOrderString?: string | null;
}

export interface CreatePaymentRefundRequest {
  paymentOrderId: EntityId;
  amount?: number;
  reason?: string;
}

export interface PaymentRefundDto {
  id: EntityId;
  refundNo: string;
  paymentOrderId: EntityId;
  orderNo: string;
  channelCode: string;
  amount: number;
  totalAmount: number;
  status: PaymentRefundStatus;
  channelRefundNo?: string | null;
  reason?: string | null;
  refundTime?: string | null;
  errorMessage?: string | null;
  creationTime: string;
}

export interface PaymentRefundQueryRequest extends QueryPageRequest {
  orderNo?: string;
  refundNo?: string;
  status?: PaymentRefundStatus;
}

export function queryPaymentOrderPage(req: PaymentOrderQueryRequest) {
  return axios.get<PaymentOrderQueryRequest, ApiResponse<PagedResultDto<PaymentOrderDto>>>(
    '/api/PaymentOrder/list',
    {
      params: {
        page: req.current,
        pageSize: req.pageSize,
        orderNo: req.orderNo,
        channelCode: req.channelCode,
        status: req.status,
        startTime: req.startTime,
        endTime: req.endTime,
      },
    }
  );
}

export function getPaymentOrderById(id: EntityId) {
  return axios.get<void, ApiResponse<PaymentOrderDto>>(`/api/PaymentOrder/${id}`);
}

export function getPaymentOrderByOrderNo(orderNo: string) {
  return axios.get<void, ApiResponse<PaymentOrderDto>>(
    `/api/PaymentOrder/order-no/${encodeURIComponent(orderNo)}`
  );
}

export function createPaymentOrder(req: CreatePaymentOrderRequest) {
  return axios.post<CreatePaymentOrderRequest, ApiResponse<CreatePaymentOrderResult>>(
    '/api/PaymentOrder/pay',
    req
  );
}

export function syncPaymentOrder(id: EntityId) {
  return axios.post<void, ApiResponse<PaymentOrderDto>>(`/api/PaymentOrder/${id}/sync`);
}

export function closePaymentOrder(id: EntityId) {
  return axios.post<void, ApiResponse<PaymentOrderDto>>(`/api/PaymentOrder/${id}/close`);
}

export function refundPaymentOrder(req: CreatePaymentRefundRequest) {
  return axios.post<CreatePaymentRefundRequest, ApiResponse<PaymentRefundDto>>(
    '/api/PaymentOrder/refund',
    req
  );
}

export function queryPaymentRefundPage(req: PaymentRefundQueryRequest) {
  return axios.get<PaymentRefundQueryRequest, ApiResponse<PagedResultDto<PaymentRefundDto>>>(
    '/api/PaymentRefund/list',
    {
      params: {
        page: req.current,
        pageSize: req.pageSize,
        orderNo: req.orderNo,
        refundNo: req.refundNo,
        status: req.status,
      },
    }
  );
}
