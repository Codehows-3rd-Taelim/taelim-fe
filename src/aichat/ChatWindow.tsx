// src/aichat/ChatWindow.tsx
import { useEffect, useRef, useState } from "react";
import type { Message } from "../type";
import ChatInput from "./ChatInput";
import ReactMarkdown from "react-markdown";

interface Props {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  isTyping: boolean;
}

export default function ChatWindow({
  messages,
  input,
  setInput,
  send,
  isTyping,
}: Props) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  /** 스크롤 위치 감지 */
  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;

    setIsAtBottom(atBottom);
  };

  /** 하단에 있을 때만 자동 스크롤 */
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages, isAtBottom]);

  return (
    <div className="h-full flex flex-col py-10">
      {/* 메시지 영역 */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-[88px]"
      >
        <div className="flex flex-col gap-3 w-full max-w-[900px] px-4 mx-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl max-w-[900px] whitespace-pre-wrap ${
                m.senderType === "USER"
                  ? "bg-orange-500 text-white self-end"
                  : "bg-white border border-gray-300 self-start"
              }`}
            >
              <ReactMarkdown>{m.rawMessage}</ReactMarkdown>
            </div>
          ))}

          {isTyping && (
            <div className="text-gray-400 italic px-4 py-2 animate-pulse self-start">
              AI가 입력 중...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="shrink-0 w-full max-w-[900px] px-4 mx-auto pt-4">
        <ChatInput input={input} setInput={setInput} send={send} size="small" />
      </div>
    </div>
  );
}
