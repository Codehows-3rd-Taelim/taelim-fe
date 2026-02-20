import { useEffect, useRef, useState } from "react";
import type { Message, ChatSource } from "../type";
import ChatInput from "./ChatInput";
import ReactMarkdown from "react-markdown";
import { Check, Copy, HelpCircle } from "lucide-react";

interface Props {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  isTyping: boolean;
  onRequestQna?: (aiIndex: number) => void;
}

export default function ChatWindow({
  messages,
  input,
  setInput,
  send,
  isTyping,
  onRequestQna,
}: Props) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
            <div key={m.id} className="flex flex-col">
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
                  <>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="leading-relaxed mb-4 last:mb-0">
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {m.rawMessage.replace(/\\n/g, "\n")}
                    </ReactMarkdown>
                    {m.isStreaming && (
                      <span className="inline-block w-[2px] h-[1em] bg-gray-400 animate-pulse ml-0.5 align-middle" />
                    )}
                  </>
                )}
              </div>

              {/* ===== 출처 표시 (AI 완료 후) ===== */}
              {m.senderType === "AI" && !m.isStreaming && m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 self-start">
                  <span className="text-xs text-gray-400 font-medium self-center">참조:</span>
                  {m.sources.map((src, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2.5 py-0.5"
                    >
                      {src.sourceType === "FILE"
                        ? `📄 ${src.fileName ?? "파일"}`
                        : `💬 QnA #${src.qnaId}`}
                    </span>
                  ))}
                </div>
              )}

              {/* ===== 액션 버튼 (스트리밍 완료 후만 표시) ===== */}
              {m.senderType === "AI" && !m.isStreaming && (
                <div className="flex gap-1.5 mt-0.5 self-start">
                  {/* 복사 */}
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(m.rawMessage, m.id)}
                      className="
                        p-1 text-gray-400 hover:text-gray-800
                        bg-transparent border-none
                        focus:outline-none active:outline-none
                      "
                    >
                      {copiedId === m.id ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
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
                      {copiedId === m.id ? "복사됨" : "복사"}
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
                      <div>AI 챗봇 답변이 도움 안 되었나요?</div>
                      <div className="mt-0.5">
                        QnA에 질문을 등록 하시겠습니까?
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && !messages.some(m => m.isStreaming && m.rawMessage !== "") && (
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
