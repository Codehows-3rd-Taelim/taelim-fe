// src/aichat/AIChat.tsx
import { useEffect, useState } from "react";
import {
  loadChatHistory,
  loadConversation,
  sendChatStream,
} from "./api/aiChatApi";
import ChatSidebar from "./ChatSidebar";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";
import { ChevronRight } from "lucide-react";
import type { AiChatDTO, Message } from "../type";
import { fetchUndeliveredNotifications } from "../notificationApi";

export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  const select = async (id: string) => {
    setCurrentId(id);
    const data = await loadConversation(id);
    setMessages(data.map(m => ({ ...m, isStreaming: false })));
    setIsSidebarOpen(false);
  };

  const newChat = () => {
    setCurrentId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const send = async (overrideText?: string) => {
    const message = overrideText ?? input;
    if (!message.trim() || isTyping) return;

    const effectiveId = currentId ?? crypto.randomUUID();

    // USER 메시지 즉시 추가
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        rawMessage: message,
        senderType: "USER",
        isStreaming: false,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      await sendChatStream(message, effectiveId);

      if (!currentId) setCurrentId(effectiveId);

      const finalMessages = await loadConversation(effectiveId);

      setMessages(
        finalMessages.map(m => ({
          ...m,
          isStreaming: false,
        }))
      );
    } finally {
      setIsTyping(false);
      loadChatHistory().then(setChatList);
      setTimeout(fetchUndeliveredNotifications, 300);
    }
  };

  return (
    <div className="relative h-full min-h-0">
      <div className="hidden md:block">
        <ChatSidebar
          chatList={chatList}
          currentId={currentId}
          select={select}
          newChat={newChat}
        />
      </div>

      {isSidebarOpen && (
        <div className="md:hidden">
          <ChatSidebar
            chatList={chatList}
            currentId={currentId}
            select={select}
            newChat={newChat}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <main className="relative flex h-full overflow-auto md:pl-80">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute z-20 p-2 bg-white rounded shadow md:hidden top-4 left-4"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div className="flex flex-col flex-1 pt-[var(--header-height)]">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState input={input} setInput={setInput} send={send} />
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              input={input}
              setInput={setInput}
              send={send}
              isTyping={isTyping}
            />
          )}
        </div>
      </main>
    </div>
  );
}
