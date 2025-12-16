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

export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 초기 목록 로드 
  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);


  const send = async (overrideText?: string) => {
  const message = overrideText ?? input;
  if (!message.trim()) return;
  if (isTyping) return;

  const effectiveId = currentId ?? crypto.randomUUID();

  // USER 메시지 추가
  setMessages(prev => [
    ...prev,
    { rawMessage: message, senderType: "USER" }
  ]);
  setInput("");
  setIsTyping(true);

  try {
    const res = await sendChatStream(message, effectiveId);

    if (!currentId) {
      setCurrentId(effectiveId);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");

    let aiMessage = "";

    setMessages(prev => [
      ...prev,
      { rawMessage: "", senderType: "AI" }
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

        aiMessage += token;

        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.senderType === "AI") {
            last.rawMessage += token;
          }
          return copy;
        });

        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    loadChatHistory().then(setChatList);

  } catch (e) {
    console.error(e);
  } finally {
    setIsTyping(false);
  }
};

  // 채팅 선택 
  const selectConversation = async (id: string) => {
    const data = await loadConversation(id);

    setMessages(data);
    setCurrentId(id);
  };

  // 새 채팅 
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
