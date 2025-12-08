interface Props {
  chatList: any[];
  currentId: string | null;
  select: (id: string) => void;
}

export default function ChatSidebar({ chatList, currentId, select }: Props) {
  return (
    <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h1 className="font-semibold text-lg mb-3">📄 내 채팅</h1>

      <div className="flex flex-col gap-1">
        {chatList.map(c => (
          <button
            key={c.conversationId}
            onClick={() => select(c.conversationId)}
            className={`p-2 rounded text-left hover:bg-orange-200 transition ${
              currentId === c.conversationId ? "bg-orange-400 text-white font-semibold" : ""
            }`}
          >
            {c.rawMessage.slice(0,18)}...
          </button>
        ))}
      </div>
    </aside>
  );
}
