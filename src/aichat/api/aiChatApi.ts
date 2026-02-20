// src/aichat/api/aiChatApi.ts
import { fetchWithAuth } from "../../store";
import { endpoints } from "../../api/endpoints";

// 채팅 목록 조회
export async function loadChatHistory() {
  const res = await fetchWithAuth(endpoints.ai.chats);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

// 특정 대화 전체 메시지 조회
export async function loadConversation(id: string) {
  const res = await fetchWithAuth(endpoints.ai.conversationMessages(id));
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

// AI 채팅 요청
export async function sendChatStream(
  message: string,
  conversationId: string
): Promise<Response> {
  const res = await fetchWithAuth(endpoints.ai.chatMessages, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!res.ok || !res.body) {
    throw new Error("AI 응답 실패");
  }

  return res;
}
