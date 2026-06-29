export function getCurrentBuildVersion(): string {
  return typeof __APP_BUILD_VERSION__ !== 'undefined'
    ? __APP_BUILD_VERSION__
    : 'dev';
}

export async function fetchRemoteBuildVersion(): Promise<string | null> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const url = `${normalizedBase}version.json?_t=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { version?: unknown };
    return typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

/** 清除 Cache / Service Worker 后强制刷新，加载最新静态资源 */
export async function reloadAndClearCache(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((item) => item.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // 清理失败仍继续刷新
  }
  window.location.reload();
}
