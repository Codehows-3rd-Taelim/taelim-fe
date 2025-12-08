interface Props {
  messages: any[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

export default function ChatWindow({ messages, scrollRef }: Props) {
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-4">
      {messages.map((m,i)=>(
        <div key={i} className={`flex ${m.senderType==="USER" ? "justify-end":"justify-start"}`}>
          <div className={`p-3 max-w-[65%] whitespace-pre-wrap rounded-xl text-sm leading-6
            ${m.senderType==="USER"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-900"}
          `}>
            {m.rawMessage}
          </div>
        </div>
      ))}
      <div ref={scrollRef}></div>
    </div>
  );
}
