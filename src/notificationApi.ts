// src/notificationApi.ts
import { useAuthStore } from "./store";
import { EventSourcePolyfill } from "event-source-polyfill";

const BASE_URL = import.meta.env.VITE_API_URL;

/* ===============================
   공통 헤더
================================ */
function authHeader() {
  const token = useAuthStore.getState().jwtToken;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/* ===============================
   타입 (1단계 최소)
================================ */
export interface Notification {
  notificationId: number;
  message: string;
  type: string;
  createdAt: string;
}

/* ===============================
   HTTP API (1단계)
================================ */

// 🔔 아직 토스트 안 뜬 알림 조회
export async function fetchUndeliveredNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE_URL}/notifications/undelivered`, {
    headers: authHeader(),
  });

  if (!res.ok) return [];
  return res.json();
}

// 🔔 토스트 노출 완료 처리
export async function markNotificationDelivered(
  notificationId: number
): Promise<void> {
  await fetch(`${BASE_URL}/notifications/${notificationId}/delivered`, {
    method: "POST",
    headers: authHeader(),
  });
}

/* ===============================
   SSE
================================ */
export function createNotificationEventSource(): EventSource | null {
  const token = useAuthStore.getState().jwtToken;
  if (!token) return null;

  return new EventSourcePolyfill(
    `${BASE_URL}/events/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      retry: -1, // 자동 재연결 끔 (pull로 보정)
    }
  );
}
