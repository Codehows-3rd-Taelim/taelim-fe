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
    setMessages(await loadConversation(id));
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

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), rawMessage: message, senderType: "USER" },
    ]);

    setInput("");
    setIsTyping(true);

    const tempAiId = `temp-ai-${crypto.randomUUID()}`;

    try {
      const res = await sendChatStream(message, effectiveId);
      if (!currentId) setCurrentId(effectiveId);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");

      setMessages((prev) => [
        ...prev,
        { id: tempAiId, rawMessage: "", senderType: "AI" },
      ]);

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const token = line.slice(5).trim();

          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAiId ? { ...m, rawMessage: m.rawMessage + token } : m
            )
          );
        }
      }

      setMessages((prev) => {
        const temp = prev.find((m) => m.id === tempAiId);
        if (!temp) return prev;
        return [
          ...prev.filter((m) => m.id !== tempAiId),
          {
            id: crypto.randomUUID(),
            rawMessage: temp.rawMessage,
            senderType: "AI",
          },
        ];
      });
    } finally {
      setIsTyping(false);
      loadChatHistory().then(setChatList);
      // 완료 후 알림 pull
      setTimeout(() => {
        fetchUndeliveredNotifications();
      }, 300);
    }
  };

  return (
    <div className="relative h-full min-h-0 bg-white">
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

      <main className="relative flex items-center justify-center h-full overflow-auto md:pl-80">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute z-20 p-2 bg-white rounded shadow md:hidden top-4 left-4"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {messages.length === 0 ? (
          <EmptyState input={input} setInput={setInput} send={send} />
        ) : (
          <ChatWindow
            messages={messages}
            input={input}
            setInput={setInput}
            send={send}
            isTyping={isTyping}
          />
        )}
      </main>
    </div>
  );
}
