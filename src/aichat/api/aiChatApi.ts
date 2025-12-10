import { useAuthStore } from "../../store";

const BASE_URL = import.meta.env.VITE_API_URL 

/** -------------------------
 *  채팅 목록 불러오기
 * ------------------------- */
export async function loadChatHistory() {
  const token = useAuthStore.getState().jwtToken;
  if (!token) throw new Error("No token");

  const res = await fetch(`${BASE_URL}/api/chat/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

/** -------------------------
 *  특정 대화 메시지 조회
 * ------------------------- */
export async function loadConversation(id: string) {
  const token = useAuthStore.getState().jwtToken;
  if (!token) throw new Error("No token");

  const res = await fetch(`${BASE_URL}/api/conversation/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

/** -------------------------
 *  메시지 전송 + SSE 스트림
 * ------------------------- */
export async function requestChatStream(message: string, conversationId: string | null) {
  const token = useAuthStore.getState().jwtToken;
  if (!token) throw new Error("No token");

  return fetch(`${BASE_URL}/api/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      conversationId
    })
  });
}

export async function createNewChat() {
  const token = useAuthStore.getState().jwtToken;
  if (!token) throw new Error("No token");

  const res = await fetch(`${BASE_URL}/api/new/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to start new chat");

  return res.json(); // { conversationId: "xxx-..." }
}