import {
  clearToken,
  getRefreshToken,
  getToken,
  isAccessTokenExpired,
} from '@/utils/auth';

/** access 已失效且无法续期时应退出登录（不主动刷新 token） */
export function shouldForceLogout() {
  if (!getToken()) {
    return true;
  }
  if (!isAccessTokenExpired()) {
    return false;
  }
  if (getRefreshToken()) {
    return false;
  }
  clearToken();
  return true;
}
