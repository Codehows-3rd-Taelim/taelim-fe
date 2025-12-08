interface Props {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
}

export default function ChatInput({ input, setInput, send }: Props) {
  return (
    <div className="w-full flex justify-center py-12">  {/* 중앙 고정 & 여백 */}
      
      {/* 📌 여기 고정 900px => 메시지 여부 관계 없이 동일 */}
      <div className="relative w-[900px] bg-white border border-gray-300 rounded-2xl shadow-md p-6">

        <textarea
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="내용을 입력해주세요."
          className="
            w-full h-[160px]
            text-[18px] text-gray-700
            outline-none resize-none leading-relaxed
            placeholder:text-gray-400
          "
        />

        <button
          onClick={send}
          className="
            absolute bottom-5 right-5
            bg-orange-500 hover:bg-orange-600
            text-white font-semibold text-sm
            px-5 py-2 rounded-md transition
          "
        >
          확인
        </button>

      </div>
    </div>
  );
}
