// src/aichat/ChatWindow.tsx
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  messages: any[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export default function ChatWindow({ messages, input, setInput, send, scrollRef }:ChatWindowProps) {
  return (
    <div className="h-full flex flex-col justify-between py-10">
      <div className="flex flex-col gap-3 w-[900px] mx-auto">
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
        <div ref={scrollRef}></div>
      </div>

      <div className="w-[900px] mx-auto">
        <ChatInput input={input} setInput={setInput} send={send} />
      </div>
    </div>
  );
}
