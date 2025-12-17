// src/aichat/AIChat.tsx
import { useEffect, useRef, useState } from "react";
import {
  loadChatHistory,
  loadConversation,
  sendChatStream,
  createNewChat,
} from "./api/aiChatApi";

import ChatSidebar from "./ChatSidebar";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";
import type { AiChatDTO, Message } from "../type";
import { fetchUndeliveredNotifications } from "../notificationApi";


export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);



const send = async (overrideText?: string) => {
  const message = overrideText ?? input;
  if (!message.trim()) return;
  if (isTyping) return;

  const effectiveId = currentId ?? crypto.randomUUID();

  // USER 메시지
  setMessages(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      rawMessage: message,
      senderType: "USER",
    },
  ]);

  setInput("");
  setIsTyping(true);

  // 임시 AI 메시지 ID
  const tempAiMessageId = `temp-ai-${crypto.randomUUID()}`;

  try {
    const res = await sendChatStream(message, effectiveId);

    if (!currentId) setCurrentId(effectiveId);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");

    // 임시 AI 메시지 먼저 추가
    setMessages(prev => [
      ...prev,
      {
        id: tempAiMessageId,
        rawMessage: "",
        senderType: "AI",
      },
    ]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const token = line.replace("data:", "").trim();
        if (!token) continue;

        // 임시 AI 메시지에만 append
        setMessages(prev =>
          prev.map(m =>
            m.id === tempAiMessageId
              ? { ...m, rawMessage: m.rawMessage + token }
              : m
          )
        );

        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

  } catch (e) {
    console.error(e);

    // 스트림 에러 시 임시 AI 메시지 제거
    setMessages(prev =>
      prev.filter(m => m.id !== tempAiMessageId)
    );

  } finally {
    setIsTyping(false);

    // 사이드바 갱신 
    loadChatHistory().then(setChatList);

    // 1번 pull
    setTimeout(() => {
      fetchUndeliveredNotifications();
    }, 100);
   
  }
};


  const selectConversation = async (id: string) => {
    const data = await loadConversation(id);
    setMessages(data);
    setCurrentId(id);
  };

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
