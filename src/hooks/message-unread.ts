import { onScopeDispose, ref } from 'vue';
import { getUnreadCount } from '@/api/server/message';
import {
  RealtimeEvents,
  type MessageUnreadChangedPayload,
} from '@/api/server/realtime';
import { onRealtimeEvent } from '@/utils/realtime-hub';

const unreadCount = ref(0);
let initialized = false;

async function fetchUnreadCount() {
  try {
    const { data } = await getUnreadCount();
    unreadCount.value = data;
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
    RealtimeEvents.MessageUnreadChanged,
    (data) => {
      const payload = data as MessageUnreadChangedPayload;
      unreadCount.value = payload.unreadCount;
    }
  );
}

export default function useMessageUnread() {
  ensureRealtimeSubscription();
  void fetchUnreadCount();

  onScopeDispose(() => {
    // shared subscription lives for app session
  });

  return {
    unreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };
}
