// src/aichat/AIChat.tsx
import { useEffect, useRef, useState } from "react";
import { createNewChat, loadChatHistory, loadConversation } from "./api/aiChatApi";
import ChatSidebar from "./ChatSidebar";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";
import { useAuthStore } from "../store";
import { EventSourcePolyfill } from 'event-source-polyfill';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function AIChat() {
  const [chatList, setChatList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);




  const token = useAuthStore.getState().jwtToken;

  /** SSE 연결 */


const connectSSE = (conversationId: string) => {
  if (!conversationId) return;

  if (eventSourceRef.current) {
    eventSourceRef.current.close();
  }

  const es = new EventSourcePolyfill(
    `${BASE_URL}/api/agent/stream/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  eventSourceRef.current = es;

  es.onmessage = (e) => {
    setMessages(prev => [...prev, { rawMessage: e.data, senderType: "AI" }]);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  es.onerror = () => {
    es.close();
    eventSourceRef.current = null;
  };
};

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  // 언마운트 시 SSE 정리
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  /** 메시지 전송 */
  const send = async (overrideText?: string) => {
    const message = overrideText ?? input;
    if (!message.trim()) return;

    setMessages(prev => [
      ...prev,
      { rawMessage: message, senderType: "USER" }
    ]);
    setInput("");

    const res = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversationId: currentId,
      }),
    });

    const newId = (await res.text()).trim();

    if (!currentId) {
      setCurrentId(newId);
      connectSSE(newId);
    } else {
      connectSSE(currentId);
    }

    loadChatHistory().then(setChatList);
  };

  /** 대화 선택 */
  const handleSelectConversation = async (id: string) => {
    const data = await loadConversation(id);
    setCurrentId(id);
    setMessages(data);
    connectSSE(id);
  };

  const handleNewChat = async () => {
  const { conversationId } = await createNewChat();

  setCurrentId(conversationId);
  setMessages([]);
  connectSSE(conversationId);

  loadChatHistory().then(setChatList);
};



  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <ChatSidebar
        chatList={chatList}
        currentId={currentId}
        select={handleSelectConversation}
        newChat={handleNewChat}
      />

      <div className="flex-1 bg-white">
        {messages.length === 0 ? (
          <EmptyState input={input} setInput={setInput} send={send} />
        ) : (
          <ChatWindow
            messages={messages}
            input={input}
            setInput={setInput}
            send={send}
            scrollRef={scrollRef}
          />
        )}
      </div>
    </div>
  );
}
