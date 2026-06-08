import { onMounted, onUnmounted } from 'vue';
import { isLogin } from '@/utils/auth';
import { startRealtimeHub, stopRealtimeHub } from '@/utils/realtime-hub';

let hubConsumers = 0;

export default function useRealtimeHub() {
  onMounted(async () => {
    if (!isLogin()) {
      return;
    }

    hubConsumers += 1;
    if (hubConsumers === 1) {
      await startRealtimeHub();
    }
  });

  onUnmounted(() => {
    hubConsumers = Math.max(0, hubConsumers - 1);
    if (hubConsumers === 0) {
      void stopRealtimeHub();
    }
  });
}
