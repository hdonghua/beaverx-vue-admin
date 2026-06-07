import { onScopeDispose, ref } from 'vue';
import { getUnreadCount } from '@/api/server/message';

const POLL_INTERVAL_MS = 30_000;

const unreadCount = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollConsumers = 0;

async function fetchUnreadCount() {
  try {
    const { data } = await getUnreadCount();
    unreadCount.value = data;
  } catch {
    // ignore polling errors
  }
}

function startPolling() {
  pollConsumers += 1;
  if (pollTimer) {
    return;
  }
  fetchUnreadCount();
  pollTimer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
}

function stopPolling() {
  pollConsumers = Math.max(0, pollConsumers - 1);
  if (pollConsumers === 0 && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export default function useMessageUnread() {
  startPolling();
  onScopeDispose(stopPolling);

  return {
    unreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };
}
