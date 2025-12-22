// src/aichat/api/aiChatApi.ts
import { useAuthStore } from "../../store";
import { EventSourcePolyfill } from "event-source-polyfill";

const BASE_URL = import.meta.env.VITE_API_URL;

// 토큰 
function authHeader() {
  const token = useAuthStore.getState().jwtToken;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// 채팅 목록 조회 
export async function loadChatHistory() {
  const res = await fetch(`${BASE_URL}/chat/history`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

// 특정 대화 전체 메시지 조회
export async function loadConversation(id: string) {
  const res = await fetch(`${BASE_URL}/conversation/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

// AI 채팅 요청 
export async function sendChatStream(
  message: string,
  conversationId: string
): Promise<Response> {
  const res = await fetch(`${BASE_URL}/agent/chat`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok || !res.body) {
    throw new Error("AI 응답 실패");
  }

  return res;
}

// 새 대화 생성 
export async function createNewChat() {
  const res = await fetch(`${BASE_URL}/new/chat`, {
    method: "POST",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to create new chat");
  return res.json(); // { conversationId }
}

export function createNotificationEventSource() {
  const token = useAuthStore.getState().jwtToken;
  if (!token) return null;

  return new EventSourcePolyfill(
    `${BASE_URL}/events/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}


