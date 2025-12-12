// src/aichat/ChatWindow.tsx
import type { Message } from "../type";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isTyping: boolean;  
}

export default function ChatWindow({ messages, input, setInput, send, scrollRef, isTyping }:ChatWindowProps) {
  return (
    <div className="h-full flex flex-col justify-between py-10">
      <div className="flex flex-col gap-3 w-[900px] mx-auto">

        {/* 기존 메시지 출력 */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[900px] ${
              m.senderType === "USER"
                ? "bg-orange-500 text-white self-end"
                : "bg-white border border-gray-300 self-start"
            }`}
          >
            {m.rawMessage}
          </div>
        ))}

        {isTyping && (
          <div className="text-gray-400 italic px-4 py-2 animate-pulse self-start">
            AI가 입력 중...
          </div>
        )}

        <div ref={scrollRef}></div>
      </div>

      <div className="w-[900px] mx-auto">
        <ChatInput input={input} setInput={setInput} send={send} />
      </div>
    </div>
  );
}
