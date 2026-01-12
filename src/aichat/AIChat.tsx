import { useEffect, useState } from "react";
import {
  loadChatHistory,
  loadConversation,
  sendChatStream,
} from "./api/aiChatApi";
import ChatSidebar from "./ChatSidebar";
import EmptyState from "./EmptyState";
import ChatWindow from "./ChatWindow";
import { ChevronRight } from "lucide-react";
import type { AiChatDTO, Message } from "../type";
import { fetchUndeliveredNotifications } from "../notificationApi";
import { createQna } from "../qna/api/qnaApi";

export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ===== QnA 모달 상태 ===== */
  const [qnaOpen, setQnaOpen] = useState(false);
  const [qnaTitle, setQnaTitle] = useState("");
  const [qnaQuestion, setQnaQuestion] = useState("");

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  const select = async (id: string) => {
    setCurrentId(id);
    const data = await loadConversation(id);
    setMessages(data.map((m) => ({ ...m, isStreaming: false })));
    setIsSidebarOpen(false);
  };

  const newChat = () => {
    setCurrentId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  /* ===== QnA 모달 열기 ===== */
  const openQnaModal = (aiIndex: number) => {
    for (let i = aiIndex - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderType === "USER") {
        setQnaTitle("");
        setQnaQuestion(m.rawMessage); // 초기값
        setQnaOpen(true);
        return;
      }
    }
    alert("연결된 사용자 질문을 찾을 수 없습니다.");
  };

  const submitQna = async () => {
    if (!qnaTitle.trim()) {
      alert("제목을 입력하세요");
      return;
    }

    await createQna({
      title: qnaTitle,
      questionText: qnaQuestion,
    });

    setQnaOpen(false);
    setQnaTitle("");
    setQnaQuestion("");
    alert("QnA로 등록되었습니다.");
  };

  const send = async (overrideText?: string) => {
    const message = overrideText ?? input;
    if (!message.trim() || isTyping) return;

    const effectiveId = currentId ?? crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        rawMessage: message,
        senderType: "USER",
        isStreaming: false,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      await sendChatStream(message, effectiveId);

      if (!currentId) setCurrentId(effectiveId);

      const finalMessages = await loadConversation(effectiveId);
      setMessages(finalMessages.map((m) => ({ ...m, isStreaming: false })));
    } finally {
      setIsTyping(false);
      loadChatHistory().then(setChatList);
      setTimeout(fetchUndeliveredNotifications, 300);
    }
  };

  return (
    <div className="relative h-full min-h-0">
      <div className="hidden md:block">
        <ChatSidebar
          chatList={chatList}
          currentId={currentId}
          select={select}
          newChat={newChat}
        />
      </div>

      <main className="relative flex h-full overflow-auto md:pl-80">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute z-20 p-2 bg-white rounded shadow md:hidden top-4 left-4"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div className="flex flex-col flex-1 pt-[var(--header-height)]">
          {messages.length === 0 ? (
            <EmptyState input={input} setInput={setInput} send={send} />
          ) : (
            <ChatWindow
              messages={messages}
              input={input}
              setInput={setInput}
              send={send}
              isTyping={isTyping}
              onCopyAi={(text) =>
                navigator.clipboard.writeText(text)
              }
              onRequestQna={openQnaModal}
            />
          )}
        </div>
      </main>

      {/* ===== QnA 등록 모달 ===== */}
      {qnaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold">QnA 등록</h3>

            <input
              value={qnaTitle}
              onChange={(e) => setQnaTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full border rounded px-3 py-2"
            />

            <textarea
              value={qnaQuestion}
              onChange={(e) => setQnaQuestion(e.target.value)}
              className="w-full border rounded px-3 py-2 min-h-[120px]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQnaOpen(false)}
                className="px-4 py-1.5 rounded bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={submitQna}
                className="px-4 py-1.5 rounded bg-slate-700 text-white"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
