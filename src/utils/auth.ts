const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const getTokenExpiresAt = () => {
  const value = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  return value ? Number(value) : 0;
};

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const setTokenExpiresAt = (expiresAt: number) => {
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
};

const setTokenPair = (
  token: string,
  refreshToken: string,
  expiresIn: number
) => {
  setToken(token);
  setRefreshToken(refreshToken);
  setTokenExpiresAt(Date.now() + expiresIn * 1000);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
};

const isTokenExpiringSoon = (thresholdMs = 5 * 60 * 1000) => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) {
    return false;
  }
  return expiresAt - Date.now() <= thresholdMs;
};

export {
  isLogin,
  getToken,
  getRefreshToken,
  getTokenExpiresAt,
  setToken,
  setRefreshToken,
  setTokenExpiresAt,
  setTokenPair,
  clearToken,
  isTokenExpiringSoon,
};
