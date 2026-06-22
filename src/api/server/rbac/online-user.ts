import { EntityId } from '@/types/entity-id';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export interface OnlineUserDto {
  userId: EntityId;
  userName: string;
  nickName?: string | null;
  connectionCount: number;
  connectedAt: string;
  lastActiveAt: string;
}

export function getOnlineUserList() {
  return axios.get<unknown, ApiResponse<OnlineUserDto[]>>(
    '/api/OnlineUser/list'
  );
}

export function kickOnlineUser(userId: EntityId) {
  return axios.post<unknown, ApiResponse<null>>(
    `/api/OnlineUser/${userId}/kick`
  );
}
