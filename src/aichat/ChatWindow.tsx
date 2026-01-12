import { useEffect, useRef, useState } from "react";
import type { Message } from "../type";
import ChatInput from "./ChatInput";
import ReactMarkdown from "react-markdown";
import { Copy, HelpCircle } from "lucide-react";

interface Props {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  isTyping: boolean;
  onCopyAi?: (text: string) => void;
  onRequestQna?: (aiIndex: number) => void;
}

export default function ChatWindow({
  messages,
  input,
  setInput,
  send,
  isTyping,
  onCopyAi,
  onRequestQna,
}: Props) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setIsAtBottom(
      el.scrollTop + el.clientHeight >= el.scrollHeight - 16
    );
  };

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages, isAtBottom]);

  return (
    <div className="h-full flex flex-col py-10">
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-[88px]"
      >
        <div className="flex flex-col gap-3 w-full max-w-[900px] px-4 mx-auto">
          {messages.map((m, idx) => (
            <div key={`${m.id}-${idx}`} className="flex flex-col">
              {/* ===== 메시지 박스 ===== */}
              <div
                className={`p-3 rounded-xl max-w-[900px] ${
                  m.senderType === "USER"
                    ? "bg-orange-500 text-white self-end whitespace-pre-wrap"
                    : "bg-white border border-gray-300 self-start"
                }`}
              >
                {m.senderType === "USER" ? (
                  <span className="whitespace-pre-wrap">
                    {m.rawMessage}
                  </span>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="leading-relaxed mb-4 last:mb-0">
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {m.rawMessage}
                  </ReactMarkdown>
                )}
              </div>

              {/* ===== AI 메시지 하단 아이콘 + 호버 텍스트 ===== */}
              {m.senderType === "AI" && (
                <div className="flex gap-1.5 mt-0.5 self-start">
                  {/* 복사 */}
                  <div className="relative group">
                    <button
                      onClick={() => onCopyAi?.(m.rawMessage)}
                      className="
                        p-1 text-gray-400 hover:text-gray-800
                        bg-transparent border-none
                        focus:outline-none active:outline-none
                      "
                    >
                      <Copy size={15} />
                    </button>

                    {/* hover text */}
                    <div
                      className="
                        absolute -top-6 left-1/2 -translate-x-1/2
                        whitespace-nowrap text-[11px]
                        text-white bg-black/80
                        px-2 py-0.5 rounded
                        opacity-0 group-hover:opacity-100
                        transition pointer-events-none
                      "
                    >
                      복사
                    </div>
                  </div>

                  {/* QnA로 보내기 */}
                  <div className="relative group">
                    <button
                      onClick={() => onRequestQna?.(idx)}
                      className="
                        p-1 text-gray-400 hover:text-gray-800
                        bg-transparent border-none
                        focus:outline-none active:outline-none
                      "
                    >
                      <HelpCircle size={15} />
                    </button>

                    {/* hover text */}
                    <div
                      className="
                        absolute -top-9 left-1/2 -translate-x-1/2
                        whitespace-nowrap text-[11px]
                        text-white bg-black/80
                        px-2 py-1 rounded
                        opacity-0 group-hover:opacity-100
                        transition pointer-events-none
                        text-center
                      "
                    >
                      <div>답변이 마음에 안 드시나요?</div>
                      <div className="mt-0.5">
                        QnA에 질문을 등록 하시겠습니까?
                      </div>
                    </div>

                  </div>
                </div>
              )}
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

      {/* ===== 입력창 ===== */}
      <div className="shrink-0 w-full max-w-[900px] px-4 mx-auto pt-4">
        <ChatInput
          input={input}
          setInput={setInput}
          send={send}
          size="small"
        />
      </div>
    </div>
  );
}
