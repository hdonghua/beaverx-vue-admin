import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';

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

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token) {
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
  (error) => {
    const status = error.response?.status;
    const problem = error.response?.data as ProblemDetails | undefined;
    const content =
      problem?.message ||
      problem?.title ||
      error.message ||
      'Request Error';

    Message.error({
      content,
      duration: 5 * 1000,
    });

    if (status === 401 && error.config?.url !== '/api/Auth/profile') {
      Modal.error({
        title: 'Confirm logout',
        content:
          'You have been logged out, you can cancel to stay on this page, or log in again',
        okText: 'Re-Login',
        async onOk() {
          const userStore = useUserStore();
          await userStore.logout();
          window.location.reload();
        },
      });
    }

    return Promise.reject(new Error(content));
  }
);
