import { defineStore } from 'pinia';
import type { AuthState } from './types';

const LEGACY_KEYS = [
  'token',
  'refresh_token',
  'token_expires_at',
  'refresh_token_expires_at',
] as const;

function migrateLegacyTokens(store: ReturnType<typeof useAuthStore>) {
  const legacyToken = localStorage.getItem('token');
  if (!legacyToken || store.token) {
    return;
  }

  store.$patch({
    token: legacyToken,
    refreshToken: localStorage.getItem('refresh_token') || '',
    tokenExpiresAt: Number(localStorage.getItem('token_expires_at') || 0),
    refreshTokenExpiresAt: Number(
      localStorage.getItem('refresh_token_expires_at') || 0
    ),
  });

  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: '',
    refreshToken: '',
    tokenExpiresAt: 0,
    refreshTokenExpiresAt: 0,
  }),

  persist: {
    key: 'auth',
    paths: [
      'token',
      'refreshToken',
      'tokenExpiresAt',
      'refreshTokenExpiresAt',
    ],
    afterRestore({ store }) {
      migrateLegacyTokens(store as ReturnType<typeof useAuthStore>);
    },
  },

  getters: {
    isAccessTokenExpired(state): boolean {
      if (!state.tokenExpiresAt) {
        return false;
      }
      return Date.now() >= state.tokenExpiresAt;
    },
    isRefreshTokenExpired(state): boolean {
      if (!state.refreshTokenExpiresAt) {
        return false;
      }
      return Date.now() >= state.refreshTokenExpiresAt;
    },
    isLogin(state): boolean {
      if (!state.token) {
        return false;
      }
      if (!state.tokenExpiresAt || Date.now() < state.tokenExpiresAt) {
        return true;
      }
      return !!state.refreshToken && !this.isRefreshTokenExpired;
    },
    isTokenExpiringSoon(state): (thresholdMs?: number) => boolean {
      return (thresholdMs = 5 * 60 * 1000) => {
        if (!state.tokenExpiresAt) {
          return false;
        }
        return state.tokenExpiresAt - Date.now() <= thresholdMs;
      };
    },
  },

  actions: {
    setTokenPair(
      token: string,
      refreshToken: string,
      expiresIn: number,
      refreshExpiresIn?: number
    ) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenExpiresAt = Date.now() + expiresIn * 1000;
      if (refreshExpiresIn != null && refreshExpiresIn > 0) {
        this.refreshTokenExpiresAt = Date.now() + refreshExpiresIn * 1000;
      }
    },
    clearToken() {
      this.token = '';
      this.refreshToken = '';
      this.tokenExpiresAt = 0;
      this.refreshTokenExpiresAt = 0;
    },
  },
});

export default useAuthStore;
