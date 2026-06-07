import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import {
  getToken,
  getRefreshToken,
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

let logoutModalVisible = false;

function promptReLogin() {
  if (logoutModalVisible) {
    return;
  }
  logoutModalVisible = true;
  Modal.error({
    title: '确认登出',
    content:
      '您已退出登录，您可以取消操作以继续留在此页面，或重新登录。',
    okText: '重新登录',
    async onOk() {
      const userStore = useUserStore();
      await userStore.logout();
      window.location.reload();
    },
    onClose() {
      logoutModalVisible = false;
    },
  });
}

axios.interceptors.request.use(
  async (config: RequestConfig) => {
    if (!isAuthBypassRequest(config) && isTokenExpiringSoon() && getRefreshToken()) {
      try {
        await refreshAccessToken();
      } catch {
        // 主动刷新失败时交由后续请求或 401 拦截处理
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
      if (!getRefreshToken()) {
        promptReLogin();
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
        promptReLogin();
        return Promise.reject(new Error(content));
      }
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
      promptReLogin();
    }

    return Promise.reject(new Error(content));
  }
);
