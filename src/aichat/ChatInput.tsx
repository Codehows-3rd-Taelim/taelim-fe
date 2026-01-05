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

  const height =
    size === "large" ? "h-[72px] md:h-[140px]" : "h-[56px] md:h-[160px]";

  const padding = size === "large" ? "p-2 md:p-5" : "p-1.5 md:p-6";

  return (
    <div
      className="
        relative
        w-full max-w-full md:max-w-[900px]
        bg-white
        border border-gray-200
        rounded-t-xl rounded-b-2xl
        shadow-[0_-4px_12px_rgba(0,0,0,0.06)]
        mx-auto mb-5
        -mt-4
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          top-0 left-0 right-0
          h-4
          rounded-t-xl
          bg-gradient-to-b
          from-white
          to-transparent
        "
      />

      <div className={padding}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          placeholder="내용을 입력해주세요."
          className={`
            w-full
            ${height}
            text-[14px] md:text-[16px]
            outline-none
            resize-none
            pr-[72px] md:pr-[80px]
          `}
        />
      </div>

      <button
        onClick={() => send(input)}
        className="absolute bottom-4 right-4 bg-[#d14e4e] hover:bg-[#d11a1a]  text-white px-4 py-2 rounded-md"
      >
        확인
      </button>
    </div>
  );
}
