// src/aichat/ChatInput.tsx
import { useState } from "react";

interface Props {
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  size?: "large" | "small";
}

export default function ChatInput({
  input,
  setInput,
  send,
  size = "small",
}: Props) {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    if (e.key === "Enter" && e.shiftKey) return;

    if (e.key === "Enter") {
      e.preventDefault();
      send(input);
    }
  };

  const height = size === "large" ? "h-[140px]" : "h-[160px]";
  const padding = size === "large" ? "p-5" : "p-6";

  return (
    <div className="relative w-full max-w-full md:max-w-[900px] bg-white border border-gray-300 rounded-2xl shadow-md mx-auto mb-5">
      <div className={padding}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          placeholder="내용을 입력해주세요."
          className={`w-full ${height} text-[16px] outline-none resize-none`}
        />
      </div>

      <button
        onClick={() => send(input)}
        className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
      >
        확인
      </button>
    </div>
  );
}
