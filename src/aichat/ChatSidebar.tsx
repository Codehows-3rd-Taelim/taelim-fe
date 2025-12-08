import { useEffect } from "react";

interface Props {
  chatList: any[];
  currentId: string | null;
  select: (id: string) => void;
}

export default function ChatSidebar({ chatList, currentId, select }: Props) {

  return (
    <aside 
      id="sidebar"
      className="w-80 bg-[#fffaf3] border-r px-2 py-4 overflow-y-auto fixed top-16 left-0 h-[calc(100vh-64px)]"
    >
      {/* 🔹 새 채팅 */}
      <h2 className="flex items-center gap-1 ml-[15px] text-3xl font-bold mb-3 pt-2 tracking-tight">
        <span className="text-2xl">📄</span>
        <span>새 채팅</span>
      </h2>


<h2 className="flex items-center gap-1 ml-[22px] mt-[45px] text-[24px] font-semibold text-gray-500 tracking-tight">
  <span>내 채팅</span>
</h2>




      <div className="flex flex-col gap-1 mt-1">
        {chatList.map(c => (
          <button
            key={c.conversationId}
            onClick={() => select(c.conversationId)}
            className={`p-2 rounded text-left hover:bg-orange-200 transition ${
              currentId === c.conversationId
                ? "bg-orange-400 text-white font-semibold"
                : ""
            }`}
          >
            {c.rawMessage.length > 10 ? c.rawMessage.slice(0, 10) + "…" : c.rawMessage}
          </button>
        ))}
      </div>

    </aside>
  );
}
