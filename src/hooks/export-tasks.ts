import { onScopeDispose, ref } from 'vue';
import { getExportActiveCount } from '@/api/server/export-task';
import {
  RealtimeEvents,
  type ExportTaskChangedPayload,
} from '@/api/server/realtime';
import { onRealtimeEvent } from '@/utils/realtime-hub';

const activeCount = ref(0);
let initialized = false;

async function fetchActiveCount() {
  try {
    const { data } = await getExportActiveCount();
    activeCount.value = data;
  } catch {
    // ignore
  }
}

function ensureRealtimeSubscription() {
  if (initialized) {
    return;
  }

  initialized = true;
  onRealtimeEvent(
    RealtimeEvents.ExportTaskChanged,
    (data) => {
      const payload = data as ExportTaskChangedPayload;
      activeCount.value = payload.activeCount;
    }
  );
}

export default function useExportTasks() {
  ensureRealtimeSubscription();
  void fetchActiveCount();

  onScopeDispose(() => {
    // shared subscription lives for app session
  });

  return {
    activeCount,
    refreshActiveCount: fetchActiveCount,
  };
}
