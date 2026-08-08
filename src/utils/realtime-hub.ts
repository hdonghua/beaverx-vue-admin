import * as signalR from '@microsoft/signalr';
import type { RealtimeMessage } from '@/api/server/common/realtime';
import { getToken } from '@/utils/auth';
import { getDeviceFingerprint } from '@/utils/device-id';

const HUB_PATH = '/hubs/notifications';
/** 需小于服务端在线 TTL（默认 90s） */
const HEARTBEAT_INTERVAL_MS = 25_000;

let connection: signalR.HubConnection | null = null;
let startingPromise: Promise<void> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

function getHubUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const deviceId = encodeURIComponent(getDeviceFingerprint());
  return `${baseUrl.replace(/\/$/, '')}${HUB_PATH}?deviceId=${deviceId}`;
}

function stopHeartbeat() {
  if (heartbeatTimer != null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (connection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    void connection.invoke('Heartbeat').catch(() => {
      // 断线重连期间忽略心跳失败
    });
  }, HEARTBEAT_INTERVAL_MS);
}

export function onRealtimeEvent(
  event: string,
  handler: (data: unknown) => void
) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(handler);

  return () => {
    listeners.get(event)?.delete(handler);
  };
}

function dispatchMessage(message: RealtimeMessage) {
  listeners.get(message.event)?.forEach((handler) => handler(message.data));
}

export async function startRealtimeHub() {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    return;
  }

  if (startingPromise) {
    await startingPromise;
    return;
  }

  startingPromise = (async () => {
    if (!getToken()) {
      return;
    }

    if (!connection) {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(getHubUrl(), {
          accessTokenFactory: () => getToken() || '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('Receive', (message: RealtimeMessage) => {
        dispatchMessage(message);
      });

      connection.onreconnected(() => {
        startHeartbeat();
      });

      connection.onclose(() => {
        stopHeartbeat();
      });
    }

    if (connection.state === signalR.HubConnectionState.Disconnected) {
      await connection.start();
      startHeartbeat();
    }
  })();

  try {
    await startingPromise;
  } finally {
    startingPromise = null;
  }
}

export async function stopRealtimeHub() {
  stopHeartbeat();
  if (connection) {
    await connection.stop();
    connection = null;
  }
}
