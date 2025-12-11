// src/aichat/AIChat.tsx
import { useEffect, useRef, useState } from "react";
import {
  loadChatHistory,
  loadConversation,
  sendMessage,
  createNewChat,
  createEventSource
} from "./api/aiChatApi";

import ChatSidebar from "./ChatSidebar";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";

export default function AIChat() {
  const [chatList, setChatList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** 🔥 너 구조의 핵심: EventSource 생성은 API에서 하고,
   *   컴포넌트는 핸들러만 관리한다.
   */
  const connectSSE = (conversationId: string) => {
    if (!conversationId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // API에서 깔끔하게 생성해온 EventSource "완제품"
    const es = createEventSource(conversationId);

    es.onopen = () => {
      setIsTyping(true);
    };

    es.onmessage = (e) => {
      setIsTyping(false);
      setMessages(prev => [...prev, { rawMessage: e.data, senderType: "AI" }]);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setIsTyping(false);
    };

    eventSourceRef.current = es;
  };

  /** 초기 목록 로드 */
  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  /** 언마운트 시 SSE 정리 */
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
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
    setIsTyping(true);

    const newId = (await sendMessage(message, currentId)).trim();
    const effectiveId = currentId ?? newId;

    if (!currentId) setCurrentId(newId);

    connectSSE(effectiveId);
    loadChatHistory().then(setChatList);
  };

  /** 채팅 선택 */
  const selectConversation = async (id: string) => {
    const data = await loadConversation(id);

    setMessages(data);
    setCurrentId(id);
  };

  /** 새 채팅 */
  const newChat = async () => {
    const { conversationId } = await createNewChat();

    setMessages([]);
    setCurrentId(conversationId);
    loadChatHistory().then(setChatList);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <ChatSidebar
        chatList={chatList}
        currentId={currentId}
        select={selectConversation}
        newChat={newChat}
      />

      <div className="flex-1 bg-white ml-80">
        {messages.length === 0 ? (
          <EmptyState input={input} setInput={setInput} send={send} />
        ) : (
          <ChatWindow
            messages={messages}
            input={input}
            setInput={setInput}
            send={send}
            scrollRef={scrollRef}
            isTyping={isTyping}
          />
        )}
      </div>
    </div>
  );
}
