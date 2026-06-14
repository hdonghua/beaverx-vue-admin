import axios from 'axios';
import {
  clearToken,
  getRefreshToken,
  isRefreshTokenExpired,
  setTokenPair,
} from '@/utils/auth';
import type { TokenResult } from '@/api/server/auth';

interface WrappedResponse<T> {
  code: number;
  msg: string;
  data: T;
}

let refreshingPromise: Promise<TokenResult> | null = null;

function unwrapTokenResult(payload: unknown): TokenResult {
  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload &&
    'data' in payload
  ) {
    const wrapped = payload as WrappedResponse<TokenResult>;
    if (wrapped.code !== 10000) {
      throw new Error(wrapped.msg || '刷新令牌失败');
    }
    return wrapped.data;
  }
  return payload as TokenResult;
}

export async function refreshAccessToken(): Promise<TokenResult> {
  if (refreshingPromise) {
    return refreshingPromise;
  }

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue || isRefreshTokenExpired()) {
    clearToken();
    throw new Error('Refresh token expired');
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  refreshingPromise = axios
    .post(
      '/api/Auth/refresh',
      { refreshToken: refreshTokenValue },
      baseURL ? { baseURL } : undefined
    )
    .then((response) => {
      const data = unwrapTokenResult(response.data);
      setTokenPair(
        data.token,
        data.refreshToken,
        data.expiresIn,
        data.refreshExpiresIn
      );
      return data;
    })
    .catch((error) => {
      clearToken();
      throw error;
    })
    .finally(() => {
      refreshingPromise = null;
    });

  return refreshingPromise;
}
