import ChatInput from "./ChatInput";

interface Props {
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
}

export default function EmptyState({ input, setInput, send }: Props) {
  const suggestions = [
    "CC1 뜨거운 물 써도 되나요?",
    "MT1 물 웅덩이 청소 가능한가요?",
    "청소 보고서를 얼마나 자주 업로드하나요?",
    "CC1 시간당 청소효율 궁금해요.",
    "MT1 소모품에 대해서 알려주세요.",
  ];

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h1 className="text-[clamp(28px,6vw,50px)] font-semibold mb-16 text-center">
        안녕하세요. 무엇을 도와드릴까요?
      </h1>

      <ChatInput input={input} setInput={setInput} send={send} size="large" />

      <div className="mt-4 w-full max-w-full md:max-w-[900px] rounded-xl shadow-xl bg-white py-4 px-6 space-y-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s)}
            className="flex gap-2 hover:text-[#324153] text-[15px]"
          >
            ❓ {s}
          </button>
        ))}
      </div>
    </div>
  );
}
