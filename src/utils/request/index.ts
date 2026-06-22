import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';
import {
  getToken,
  getRefreshToken,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  isTokenExpiringSoon,
} from '@/utils/auth';
import { handleSessionExpired } from '@/utils/session-expired';
import { refreshAccessToken } from './refresh-token';

export * from './types';
export { refreshAccessToken } from './refresh-token';

interface ProblemDetails {
  message?: string;
  title?: string;
}

type RequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  _retry?: boolean;
};

const AUTH_REFRESH_URL = '/api/Auth/refresh';
const AUTH_LOGIN_URL = '/api/Auth/login';
const AUTH_LOGOUT_URL = '/api/Auth/logout';

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

function isAuthBypassRequest(config?: RequestConfig) {
  const url = config?.url || '';
  return (
    config?.skipAuth ||
    url.includes(AUTH_REFRESH_URL) ||
    url.includes(AUTH_LOGIN_URL) ||
    url.includes(AUTH_LOGOUT_URL)
  );
}

function shouldSkipTokenRefresh(config?: RequestConfig) {
  return config?.skipRefresh || isAuthBypassRequest(config);
}

function rejectUnauthorized() {
  void handleSessionExpired();
  return Promise.reject(new Error('Unauthorized'));
}

axios.interceptors.request.use(
  async (config: RequestConfig) => {
    if (!shouldSkipTokenRefresh(config)) {
      const refreshToken = getRefreshToken();
      const refreshExpired = isRefreshTokenExpired();
      const accessExpired = isAccessTokenExpired();
      const needRefresh = accessExpired || isTokenExpiringSoon();

      if (needRefresh) {
        if (!refreshToken || refreshExpired) {
          return rejectUnauthorized();
        }
        try {
          await refreshAccessToken();
        } catch {
          return rejectUnauthorized();
        }
      }
    }

    const token = getToken();
    if (token && !config.skipAuth) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    if (
      payload &&
      typeof payload === 'object' &&
      'code' in payload &&
      'data' in payload
    ) {
      const wrapped = payload as { code: number; msg: string; data: unknown };
      if (wrapped.code !== 10000) {
        Message.error({
          content: wrapped.msg || 'Error',
          duration: 5 * 1000,
        });
        return Promise.reject(new Error(wrapped.msg || 'Error'));
      }
      return { data: wrapped.data };
    }
    return { data: payload };
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as RequestConfig | undefined;
    const problem = error.response?.data as ProblemDetails | undefined;
    const content =
      problem?.message ||
      problem?.title ||
      error.message ||
      'Request Error';

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthBypassRequest(originalRequest)
    ) {
      if (!getRefreshToken() || isRefreshTokenExpired()) {
        void handleSessionExpired();
        return Promise.reject(new Error(content));
      }

      originalRequest._retry = true;

      try {
        const tokenResult = await refreshAccessToken();
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${tokenResult.token}`;
        return axios(originalRequest);
      } catch {
        void handleSessionExpired();
        return Promise.reject(new Error(content));
      }
    }

    if (status === 403) {
      const forbiddenMessage = '没有权限访问该资源';
      Message.error({
        content: forbiddenMessage,
        duration: 5 * 1000,
      });
      return Promise.reject(new Error(forbiddenMessage));
    }

    if (originalRequest?.url?.includes(AUTH_LOGOUT_URL)) {
      return Promise.reject(new Error(content));
    }

    Message.error({
      content,
      duration: 5 * 1000,
    });

    if (
      status === 401 &&
      originalRequest?.url !== '/api/Auth/profile' &&
      isAuthBypassRequest(originalRequest) &&
      !originalRequest?.url?.includes(AUTH_LOGOUT_URL)
    ) {
      void handleSessionExpired();
    }

    return Promise.reject(new Error(content));
  }
);
