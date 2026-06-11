import axios from 'axios';
import { ApiResponse } from '@/api/interceptor';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface UserProfileDto {
  id: number;
  userName: string;
  nickName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  roles: string[];
  permissions: string[];
}

export interface TokenResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginResponse extends TokenResult {
  user: UserProfileDto;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/** 登录 */
export function login(req: LoginRequest) {
  return axios.post<LoginRequest, ApiResponse<LoginResponse>>(
    '/api/Auth/login',
    req
  );
}

/** 刷新访问令牌 */
export function refreshToken(req: RefreshTokenRequest) {
  return axios.post<RefreshTokenRequest, ApiResponse<TokenResult>>(
    '/api/Auth/refresh',
    req,
    {
      skipAuth: true,
      skipRefresh: true,
    } as Record<string, unknown>
  );
}

/** 当前用户信息 */
export function getProfile() {
  return axios.get<void, ApiResponse<UserProfileDto>>('/api/Auth/profile');
}

export interface UpdateProfileRequest {
  nickName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/** 更新当前用户基本信息 */
export function updateProfile(req: UpdateProfileRequest) {
  return axios.put<UpdateProfileRequest, ApiResponse<UserProfileDto>>(
    '/api/Auth/profile',
    req
  );
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** 修改当前用户密码 */
export function changePassword(req: ChangePasswordRequest) {
  return axios.put<ChangePasswordRequest, ApiResponse<void>>(
    '/api/Auth/password',
    req
  );
}

/** 登出并吊销刷新令牌 */
export function logout(refreshTokenValue?: string | null) {
  return axios.post<RefreshTokenRequest | undefined, ApiResponse<void>>(
    '/api/Auth/logout',
    refreshTokenValue ? { refreshToken: refreshTokenValue } : undefined,
    {
      skipAuth: true,
      skipRefresh: true,
    } as Record<string, unknown>
  );
}
