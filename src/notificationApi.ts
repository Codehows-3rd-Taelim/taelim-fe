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
   타입
================================ */
export interface Notification {
  notificationId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

/* ===============================
   HTTP API
================================ */

// 미읽음 알림 조회
export async function fetchUnreadNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE_URL}/notifications/unread`, {
    headers: authHeader(),
  });

  if (!res.ok) return [];
  return res.json();
}

// 알림 읽음 처리
export async function markNotificationAsRead(
  notificationId: number
): Promise<void> {
  await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
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
      retry: -1,
    }
  );
}
