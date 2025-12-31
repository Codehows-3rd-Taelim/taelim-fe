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

/** AI 메시지 문장 간격 보정 */
function normalizeSentenceSpacing(text: string) {
  const codeBlocks: string[] = [];

  const protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;
  });

  let result = protectedText.replace(/([.!?])([가-힣])/g, "$1 $2");

  codeBlocks.forEach((block, i) => {
    result = result.replace(`@@CODE_BLOCK_${i}@@`, block);
  });

  return result;
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
        className="flex-1 overflow-y-auto"
      >
        <div className="flex flex-col gap-3 w-[900px] mx-auto">
          {messages.map((m) => {
            const text =
              m.senderType === "AI"
                ? normalizeSentenceSpacing(m.rawMessage)
                : m.rawMessage;

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl max-w-[900px] whitespace-pre-wrap ${
                  m.senderType === "USER"
                    ? "bg-orange-500 text-white self-end"
                    : "bg-white border border-gray-300 self-start"
                }`}
              >
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            );
          })}

          {isTyping && (
            <div className="text-gray-400 italic px-4 py-2 animate-pulse self-start">
              AI가 입력 중...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="shrink-0 w-[900px] mx-auto pt-4 -translate-x-[7px]">
        <ChatInput input={input} setInput={setInput} send={send} size="small" />
      </div>
    </div>
  );
}
