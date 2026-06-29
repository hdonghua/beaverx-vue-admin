import { onMounted, onUnmounted, ref } from 'vue';
import {
  fetchRemoteBuildVersion,
  getCurrentBuildVersion,
  reloadAndClearCache,
} from '@/utils/app-version';

/** 轮询检测服务端是否有新构建 */
const UPDATE_CHECK_INTERVAL_MS = 60 * 1000;
/** 点击「稍后」后再次提醒的间隔 */
const UPDATE_SNOOZE_INTERVAL_MS = 5 * 60 * 1000;

export default function useAppUpdate() {
  const visible = ref(false);

  let updateAvailable = false;
  let checkTimer: ReturnType<typeof setInterval> | null = null;
  let snoozeTimer: ReturnType<typeof setTimeout> | null = null;

  const clearSnoozeTimer = () => {
    if (snoozeTimer) {
      clearTimeout(snoozeTimer);
      snoozeTimer = null;
    }
  };

  const showIfPending = () => {
    if (updateAvailable && !snoozeTimer) {
      visible.value = true;
    }
  };

  const checkVersion = async () => {
    if (!import.meta.env.PROD) {
      return;
    }
    const remote = await fetchRemoteBuildVersion();
    if (!remote) {
      return;
    }
    const current = getCurrentBuildVersion();
    if (remote !== current) {
      updateAvailable = true;
      showIfPending();
    } else {
      updateAvailable = false;
      visible.value = false;
      clearSnoozeTimer();
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkVersion();
    }
  };

  const snooze = () => {
    visible.value = false;
    clearSnoozeTimer();
    snoozeTimer = setTimeout(() => {
      snoozeTimer = null;
      showIfPending();
    }, UPDATE_SNOOZE_INTERVAL_MS);
  };

  const refresh = () => {
    reloadAndClearCache();
  };

  onMounted(() => {
    if (!import.meta.env.PROD) {
      return;
    }
    checkVersion();
    checkTimer = setInterval(checkVersion, UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkVersion);
  });

  onUnmounted(() => {
    if (checkTimer) {
      clearInterval(checkTimer);
    }
    clearSnoozeTimer();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', checkVersion);
  });

  return {
    visible,
    snooze,
    refresh,
  };
}
