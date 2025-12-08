interface Props {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
}

export default function EmptyState({ input, setInput, send }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="text-2xl font-semibold">안녕하세요. 무엇을 도와드릴까요?</h2>

      <textarea
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        className="w-[600px] h-48 p-4 border rounded-lg text-lg"
        placeholder="내용을 입력해 주세요."
      />

      <button onClick={send} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded">
        확인
      </button>

      <div className="mt-6 text-orange-600 text-sm">
        <p className="text-gray-500">예시 질문 ⬇</p>
        <div className="flex flex-col mt-2 gap-1">
          <span>• 브러쉬가 작동이 안돼</span>
          <span>• 로봇 크기랑 무게가 어떻게 돼?</span>
          <span>• 소모품 어디서 구매하나요?</span>
        </div>
      </div>
    </div>
  );
}
