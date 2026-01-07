import ChatInput from "./ChatInput";

interface Props {
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
}

export default function EmptyState({ input, setInput, send }: Props) {
  const suggestions = [
    "브러시가 작동이 안돼",
    "회사 정보 알려줘",
    "로봇 크기와 무게가 어떻게 되나요?",
    "소모품은 어디서 구입하나요?",
    "사용 방법이 궁금해",
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
