import pinia from '@/store/pinia';
import useAuthStore from '@/store/modules/auth';

function store() {
  return useAuthStore(pinia);
}

const isAccessTokenExpired = () => store().isAccessTokenExpired;

const isRefreshTokenExpired = () => store().isRefreshTokenExpired;

const isLogin = () => store().isLogin;

const getToken = () => store().token || null;

const getRefreshToken = () => store().refreshToken || null;

const getTokenExpiresAt = () => store().tokenExpiresAt;

const getRefreshTokenExpiresAt = () => store().refreshTokenExpiresAt;

const setToken = (token: string) => {
  store().token = token;
};

const setRefreshToken = (refreshToken: string) => {
  store().refreshToken = refreshToken;
};

const setTokenExpiresAt = (expiresAt: number) => {
  store().tokenExpiresAt = expiresAt;
};

const setRefreshTokenExpiresAt = (expiresAt: number) => {
  store().refreshTokenExpiresAt = expiresAt;
};

const setTokenPair = (
  token: string,
  refreshToken: string,
  expiresIn: number,
  refreshExpiresIn?: number
) => {
  store().setTokenPair(token, refreshToken, expiresIn, refreshExpiresIn);
};

const clearToken = () => {
  store().clearToken();
};

const isTokenExpiringSoon = (thresholdMs = 5 * 60 * 1000) =>
  store().isTokenExpiringSoon(thresholdMs);

export {
  isLogin,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  getToken,
  getRefreshToken,
  getTokenExpiresAt,
  getRefreshTokenExpiresAt,
  setToken,
  setRefreshToken,
  setTokenExpiresAt,
  setRefreshTokenExpiresAt,
  setTokenPair,
  clearToken,
  isTokenExpiringSoon,
};
