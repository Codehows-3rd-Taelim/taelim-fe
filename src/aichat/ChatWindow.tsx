// src/aichat/ChatWindow.tsx
import type { Message } from "../type";
import ChatInput from "./ChatInput";
import ReactMarkdown from "react-markdown";


interface ChatWindowProps {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isTyping: boolean;
}


// 문장 사이 공백 보정 (AI 메시지 전용)
function normalizeSentenceSpacing(text: string) {
  // 코드블록 보호
  const codeBlocks: string[] = [];
  const protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;
  });

  // 마침표/물음표/느낌표 뒤에 한글이 바로 붙으면 공백 삽입
  let result = protectedText.replace(
    /([.!?])([가-힣])/g,
    "$1 $2"
  );

  // 코드블록 복원
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
  scrollRef,
  isTyping,
}: ChatWindowProps) {
  return (
    <div className="h-full flex flex-col justify-between py-10">
      <div className="flex flex-col gap-3 w-[900px] mx-auto">
        {messages.map((m) => {
          const displayText =
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
              <ReactMarkdown>{displayText}</ReactMarkdown>
            </div>
          );
        })}

        {isTyping && (
          <div className="text-gray-400 italic px-4 py-2 animate-pulse self-start">
            AI가 입력 중...
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <div className="w-[900px] mx-auto">
        <ChatInput input={input} setInput={setInput} send={send} size="small" />
      </div>
    </div>
  );
}
