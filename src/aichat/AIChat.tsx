import { useEffect, useRef, useState } from "react";
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

export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  const select = async (id: string) => {
    setCurrentId(id);
    const data = await loadConversation(id);
    setMessages(data);
    setIsSidebarOpen(false); // 모바일: 선택 후 닫기
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

    // USER
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
              m.id === tempAiId
                ? { ...m, rawMessage: m.rawMessage + token }
                : m
            )
          );
        }

        requestAnimationFrame(() =>
          scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        );
      }

      setMessages((prev) => {
        const temp = prev.find((m) => m.id === tempAiId);
        if (!temp) return prev;
        return [
          ...prev.filter((m) => m.id !== tempAiId),
          { id: crypto.randomUUID(), rawMessage: temp.rawMessage, senderType: "AI" },
        ];
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
      loadChatHistory().then(setChatList);
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] bg-white">
      {/* 데스크탑: 항상 사이드바 */}
      <div className="hidden md:block">
        <ChatSidebar
          chatList={chatList}
          currentId={currentId}
          select={select}
          newChat={newChat}
        />
      </div>

      {/* 모바일: 열렸을 때만 사이드바*/}
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

      {/* 메인 영역: 사이드바 폭만큼 패딩 (데스크탑) */}
      <main className="h-full md:pl-80 relative">
        {/* 모바일: 열기 버튼  */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-200 p-2 bg-white rounded shadow"
            aria-label="사이드바 열기"
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
            scrollRef={scrollRef}
            isTyping={isTyping}
          />
        )}
      </main>
    </div>
  );
}
