import ChatInput from "./ChatInput";

interface Props {
  messages: any[];
  input: string;
  setInput: (v: string) => void;
  send: (v?: string) => void;
  scrollRef: any;
}

export default function ChatWindow({ messages, input, setInput, send, scrollRef }: Props) {
  return (
    <div className="h-full flex flex-col justify-between py-10">

      {/* 🔥 메시지 박스 + 너비 900px 중앙 고정 */}
      <div className="flex flex-col gap-3 w-[900px] mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl max-w-[900px] ${m.senderType === "USER" ? "bg-orange-500 text-white self-end" : "bg-white border self-start"}`}>
            {m.rawMessage}
          </div>
        ))}

        <div ref={scrollRef}></div>
      </div>

      {/* 🔥 입력창도 같은폭 900px */}
      <div className="w-[900px] mx-auto">
        <ChatInput input={input} setInput={setInput} send={send} />
      </div>
    </div>
  );
}
