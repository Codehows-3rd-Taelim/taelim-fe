import { useEffect, useRef, useState } from "react";
import {loadChatHistory,loadConversation,sendChatStream,} from "./api/aiChatApi";
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

  // 채팅 목록 로드
  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  // 채팅 선택
  const select = async (id: string) => {
    setCurrentId(id);
    const data = await loadConversation(id);
    setMessages(data);
  };

  // 새 채팅
  const newChat = () => {
    setCurrentId(null);
    setMessages([]);
  };

  // 메시지 전송
  const send = async (overrideText?: string) => {
    const message = overrideText ?? input;
    if (!message.trim()) return;
    if (isTyping) return;

    const effectiveId = currentId ?? crypto.randomUUID();

    // USER 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        rawMessage: message,
        senderType: "USER",
      },
    ]);

    setInput("");
    setIsTyping(true);

    const tempAiMessageId = `temp-ai-${crypto.randomUUID()}`;

    try {
      const res = await sendChatStream(message, effectiveId);
      if (!currentId) setCurrentId(effectiveId);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");

      // temp AI 메시지 생성
      setMessages((prev) => [
        ...prev,
        {
          id: tempAiMessageId,
          rawMessage: "",
          senderType: "AI",
        },
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

          let token = line.slice(5);
          if (token.startsWith(" ")) token = token.slice(1);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAiMessageId
                ? { ...m, rawMessage: m.rawMessage + token }
                : m
            )
          );
        }

        requestAnimationFrame(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }

      // 스트리밍 종료 → temp-ai 제거 + 확정 메시지 추가
      setMessages((prev) => {
        const temp = prev.find((m) => m.id === tempAiMessageId);
        if (!temp) return prev;

        return [
          ...prev.filter((m) => m.id !== tempAiMessageId),
          {
            id: crypto.randomUUID(),
            rawMessage: temp.rawMessage,
            senderType: "AI",
          },
        ];
      });
    } catch (e) {
      console.error(e);
      setMessages((prev) => prev.filter((m) => m.id !== tempAiMessageId));
    } finally {
      setIsTyping(false);
      loadChatHistory().then(setChatList);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <ChatSidebar
        chatList={chatList}
        currentId={currentId}
        select={select}
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
