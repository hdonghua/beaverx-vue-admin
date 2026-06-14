import * as signalR from '@microsoft/signalr';
import type { RealtimeMessage } from '@/api/server/common/realtime';
import { getToken } from '@/utils/auth';

const HUB_PATH = '/hubs/notifications';

let connection: signalR.HubConnection | null = null;
let startingPromise: Promise<void> | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

function getHubUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl.replace(/\/$/, '')}${HUB_PATH}`;
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
    }

    if (connection.state === signalR.HubConnectionState.Disconnected) {
      await connection.start();
    }
  })();

  try {
    await startingPromise;
  } finally {
    startingPromise = null;
  }
}

export async function stopRealtimeHub() {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}
