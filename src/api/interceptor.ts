import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import {
  getToken,
  getRefreshToken,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  isTokenExpiringSoon,
} from '@/utils/auth';
import { refreshAccessToken } from '@/api/refresh-token';

export interface Msg<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiResponse<T = unknown> {
  data: T;
}

export type HttpResponse<T = unknown> = ApiResponse<T>;

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

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

function isAuthBypassRequest(config?: RequestConfig) {
  const url = config?.url || '';
  return (
    config?.skipAuth ||
    config?.skipRefresh ||
    url.includes(AUTH_REFRESH_URL) ||
    url.includes(AUTH_LOGIN_URL)
  );
}

let forceLoggingOut = false;

async function forceLogout(message = '登录已过期，请重新登录') {
  if (forceLoggingOut) {
    return;
  }
  forceLoggingOut = true;
  Message.warning({ content: message, duration: 3000 });
  const userStore = useUserStore();
  await userStore.logout();
  window.location.reload();
}

axios.interceptors.request.use(
  async (config: RequestConfig) => {
    if (!isAuthBypassRequest(config)) {
      const refreshToken = getRefreshToken();
      const refreshExpired = isRefreshTokenExpired();
      const accessExpired = isAccessTokenExpired();
      const needRefresh = accessExpired || isTokenExpiringSoon();

      if (needRefresh) {
        if (!refreshToken || refreshExpired) {
          void forceLogout();
          return Promise.reject(new Error('Unauthorized'));
        }
        try {
          await refreshAccessToken();
        } catch {
          void forceLogout();
          return Promise.reject(new Error('Unauthorized'));
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
      const wrapped = payload as Msg;
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
        void forceLogout();
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
        void forceLogout();
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

    Message.error({
      content,
      duration: 5 * 1000,
    });

    if (
      status === 401 &&
      originalRequest?.url !== '/api/Auth/profile' &&
      isAuthBypassRequest(originalRequest)
    ) {
      void forceLogout();
    }

    return Promise.reject(new Error(content));
  }
);
