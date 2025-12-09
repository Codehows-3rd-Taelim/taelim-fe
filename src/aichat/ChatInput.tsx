interface Props {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
}

// src/aichat/ChatInput.tsx
export default function ChatInput({ input, setInput, send }: Props) {
  return (
    <div className="w-full flex justify-center py-12">
      <div className="relative w-[900px] bg-white border border-gray-300 rounded-2xl shadow-md p-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="내용을 입력해주세요."
          className="w-full h-[160px] text-[18px] outline-none resize-none"
        />

        <button
          onClick={send}
          className="absolute bottom-5 right-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md"
        >
          확인
        </button>
      </div>
    </div>
  );
}
