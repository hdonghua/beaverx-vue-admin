import NProgress from 'nprogress';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getRefreshToken } from '@/utils/auth';
import { logout as userLogout } from '@/api/server/auth';

let handlingSessionExpired = false;

/** 清除本地会话并提示；重复调用会被忽略 */
export function clearSessionAndNotify(
  message = '登录已过期，请重新登录'
): boolean {
  if (handlingSessionExpired) {
    return false;
  }
  handlingSessionExpired = true;

  NProgress.done();
  Message.warning({ content: message, duration: 3000 });

  const userStore = useUserStore();
  const refreshToken = getRefreshToken();
  userStore.logoutCallBack();

  if (refreshToken) {
    void userLogout(refreshToken).catch(() => {
      // 令牌已失效时服务端登出失败可忽略
    });
  }

  return true;
}

export function resetSessionExpiredState() {
  handlingSessionExpired = false;
}

export async function redirectToLoginPage(redirectPath?: string) {
  const { default: router } = await import('@/router');
  const redirect =
    redirectPath && redirectPath !== '/login'
      ? redirectPath
      : router.currentRoute.value.fullPath;

  if (router.currentRoute.value.name === 'login') {
    return;
  }

  await router.replace({
    name: 'login',
    query:
      redirect && redirect !== '/login' ? { redirect } : undefined,
  });
}

/** 拦截器等非路由守卫场景：清理会话并跳转登录页 */
export async function handleSessionExpired(
  message = '登录已过期，请重新登录',
  redirectPath?: string
) {
  if (!clearSessionAndNotify(message)) {
    return;
  }
  await redirectToLoginPage(redirectPath);
}
