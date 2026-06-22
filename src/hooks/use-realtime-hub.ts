import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { isLogin } from '@/utils/auth';
import {
  startRealtimeHub,
  stopRealtimeHub,
  onRealtimeEvent,
} from '@/utils/realtime-hub';
import {
  RealtimeEvents,
  type UserDisabledPayload,
  type UserForceOfflinePayload,
} from '@/api/server/common/realtime';
import useUserStore from '@/store/modules/user';

let hubConsumers = 0;
let unsubscribeUserDisabled: (() => void) | null = null;
let unsubscribeUserForceOffline: (() => void) | null = null;

export default function useRealtimeHub() {
  const userStore = useUserStore();
  const router = useRouter();

  const handleForcedLogout = async (message: string) => {
    Message.warning(message);
    await userStore.logout();
    router.push({ name: 'login' });
  };

  onMounted(async () => {
    if (!isLogin()) {
      return;
    }

    hubConsumers += 1;
    if (hubConsumers === 1) {
      await startRealtimeHub();
      unsubscribeUserDisabled = onRealtimeEvent(
        RealtimeEvents.UserDisabled,
        (data) => {
          const payload = (data || {}) as UserDisabledPayload;
          handleForcedLogout(
            payload.message || '您的账号已被禁用，即将退出登录'
          );
        }
      );
      unsubscribeUserForceOffline = onRealtimeEvent(
        RealtimeEvents.UserForceOffline,
        (data) => {
          const payload = (data || {}) as UserForceOfflinePayload;
          handleForcedLogout(payload.message || '您已被管理员强制下线');
        }
      );
    }
  });

  onUnmounted(() => {
    hubConsumers = Math.max(0, hubConsumers - 1);
    if (hubConsumers === 0) {
      unsubscribeUserDisabled?.();
      unsubscribeUserDisabled = null;
      unsubscribeUserForceOffline?.();
      unsubscribeUserForceOffline = null;
      void stopRealtimeHub();
    }
  });
}
