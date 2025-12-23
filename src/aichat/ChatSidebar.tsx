import type { AiChatDTO } from "../type";
import { ChevronLeft, FileText } from "lucide-react";

interface Props {
  chatList: AiChatDTO[];
  currentId: string | null;
  select: (id: string) => void;
  newChat: () => void;
  onClose?: () => void; // 모바일 닫기
}

export default function ChatSidebar({
  chatList,
  currentId,
  select,
  newChat,
  onClose,
}: Props) {
  return (
    <aside className="absolute inset-y-0 left-0 w-80 bg-[#fffaf3] border-r px-3 py-5 overflow-y-auto z-20">
      {/* 상단 */}
      <div className="flex items-center justify-between pr-1">
       <button
        onClick={newChat}
        className="flex items-center px-4 py-2 rounded-lg hover:bg-orange-200"
      >
        <FileText size={22} className="mr-2" />
          <span className="text-[22px] font-bold leading-none">
            새 채팅
          </span>
        </button>


        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded hover:bg-orange-200"
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>

      <div className="mt-10 mb-4">
        <h2 className="ml-2 text-[30px] font-bold text-gray-700">내 채팅</h2>
      </div>

      <div className="flex flex-col gap-1">
        {chatList.map((c) => (
          <button
            key={c.conversationId}
            onClick={() => select(c.conversationId)}
            className={`p-2 rounded text-left hover:bg-orange-200 ${
              currentId === c.conversationId
                ? "bg-orange-400 text-white font-semibold"
                : "text-gray-800"
            }`}
          >
            {c.rawMessage.length > 10
              ? c.rawMessage.slice(0, 10) + "…"
              : c.rawMessage}
          </button>
        ))}
      </div>
    </aside>
  );
}
