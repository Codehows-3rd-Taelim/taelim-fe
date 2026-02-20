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
import type { AiChatDTO, Message, ChatSource } from "../type";
import { createQna } from "../qna/api/qnaApi";
import QnaCreateModal from "../qna/components/QnaCreateModal";
import { readSseStream } from "../lib/sseStream";

export default function AIChat() {
  const [chatList, setChatList] = useState<AiChatDTO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ===== QnA 모달 상태 ===== */
  const [qnaOpen, setQnaOpen] = useState(false);
  const [qnaQuestion, setQnaQuestion] = useState("");

  useEffect(() => {
    loadChatHistory().then(setChatList).catch(console.error);
  }, []);

  const select = async (id: string) => {
    setCurrentId(id);
    const data = await loadConversation(id);
    setMessages(data.map((m: AiChatDTO) => ({ ...m, isStreaming: false })));
    setIsSidebarOpen(false);
  };

  const newChat = () => {
    setCurrentId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  // QnA 모달 열기
  const openQnaModal = (aiIndex: number) => {
    for (let i = aiIndex - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderType === "USER") {
        setQnaQuestion(m.rawMessage);
        setQnaOpen(true);
        return;
      }
    }
    alert("연결된 사용자 질문을 찾을 수 없습니다.");
  };

  const handleQnaSubmit = async (title: string, questionText: string) => {
    await createQna({ title, questionText });
    setQnaOpen(false);
    setQnaQuestion("");
    alert("QnA로 등록되었습니다.");
  };

  const send = async (overrideText?: string) => {
    const message = overrideText ?? input;
    if (!message.trim() || isTyping) return;

    const effectiveId = currentId ?? crypto.randomUUID();
    const streamingMessageId = crypto.randomUUID();

    // 새 대화 시작 시 사이드바에 낙관적 추가
    if (!currentId) {
      setChatList((prev) => [
        {
          conversationId: effectiveId,
          rawMessage: message,
          aiChatId: 0,
          senderType: "USER" as const,
          createdAt: new Date().toISOString(),
          messageIndex: 0,
          userId: 0,
          userName: "",
        },
        ...prev,
      ]);
      setCurrentId(effectiveId);
    }

    // 사용자 메시지 + AI 스트리밍 플레이스홀더 동시 추가
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), rawMessage: message, senderType: "USER", isStreaming: false },
      { id: streamingMessageId, rawMessage: "", senderType: "AI", isStreaming: true },
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatStream(message, effectiveId);

      let firstToken = true;

      for await (const { event, data } of readSseStream(response)) {
        if (event === "token") {
          if (firstToken) {
            setIsTyping(false);  // 첫 토큰 도착 → 로딩 인디케이터 숨김
            firstToken = false;
          }
          // 백엔드에서 SSE 안전 전송을 위해 \n을 이스케이프했으므로 복원
          const decodedToken = data.replace(/\\n/g, "\n");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMessageId
                ? { ...m, rawMessage: m.rawMessage + decodedToken }
                : m
            )
          );
        } else if (event === "sources") {
          try {
            const sources: ChatSource[] = JSON.parse(data);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingMessageId ? { ...m, sources } : m
              )
            );
          } catch { /* 파싱 실패 시 출처 없이 진행 */ }
        } else if (event === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMessageId ? { ...m, isStreaming: false } : m
            )
          );
        }
      }

    } catch (e) {
      console.error("스트리밍 오류", e);
      setMessages((prev) => prev.filter((m) => m.id !== streamingMessageId));
    } finally {
      setIsTyping(false);
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

      {isSidebarOpen && (
        <div className="md:hidden">
          <ChatSidebar
            chatList={chatList}
            currentId={currentId}
            select={select}
            newChat={newChat}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <main className="relative flex h-full overflow-auto md:pl-64 lg:pl-80">
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
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                input={input}
                setInput={setInput}
                send={send}
              />
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              input={input}
              setInput={setInput}
              send={send}
              isTyping={isTyping}
              onRequestQna={openQnaModal}
            />
          )}
        </div>
      </main>

      <QnaCreateModal
        open={qnaOpen}
        onClose={() => setQnaOpen(false)}
        onSubmit={handleQnaSubmit}
        initialQuestion={qnaQuestion}
        variant="compact"
      />
    </div>
  );
}
