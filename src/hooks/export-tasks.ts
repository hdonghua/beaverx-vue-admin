import { onScopeDispose, ref } from 'vue';
import { getExportActiveCount } from '@/api/server/export-task';

const POLL_INTERVAL_MS = 3000;

const activeCount = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollConsumers = 0;

async function fetchActiveCount() {
  try {
    const { data } = await getExportActiveCount();
    activeCount.value = data;
    if (data > 0 && !pollTimer) {
      startFastPolling();
    }
    if (data === 0 && pollTimer) {
      stopFastPolling();
    }
  } catch {
    // ignore polling errors
  }
}

function startFastPolling() {
  if (pollTimer) {
    return;
  }
  pollTimer = setInterval(fetchActiveCount, POLL_INTERVAL_MS);
}

function stopFastPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling() {
  pollConsumers += 1;
  if (pollConsumers === 1) {
    fetchActiveCount();
  }
}

function stopPolling() {
  pollConsumers = Math.max(0, pollConsumers - 1);
  if (pollConsumers === 0) {
    stopFastPolling();
  }
}

export default function useExportTasks() {
  startPolling();
  onScopeDispose(stopPolling);

  return {
    activeCount,
    refreshActiveCount: fetchActiveCount,
  };
}
