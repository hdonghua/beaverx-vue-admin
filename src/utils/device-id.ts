const STORAGE_KEY = 'beaverx:device-fingerprint';

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 同源多标签共享的浏览器设备指纹（持久化到 localStorage）。 */
export function getDeviceFingerprint(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing) {
      return existing;
    }

    const created = createDeviceId();
    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return createDeviceId();
  }
}
