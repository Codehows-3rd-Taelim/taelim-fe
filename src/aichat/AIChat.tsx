import ChatSidebar from "../aichat/ChatSidebar";
import ChatWindow from "../aichat/ChatWindow";
import ChatInput from "../aichat/ChatInput";
import EmptyState from "../aichat/EmptyState";
import { useEffect, useRef, useState } from "react";

export default function AIChat() {
  const [chatList, setChatList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);


  /** 🔥 1) 채팅 리스트 불러오기 */
  const loadChatHistory = async () => {
    const token = localStorage.getItem("jwtToken");

    const res = await fetch("/api/chat-history", {
      headers: { Authorization: `Bearer ${token}` }  // ⬅ 변경된 부분
    });

    setChatList(await res.json());
  };


  /** 🔥 2) 대화 선택 */
  const loadConversation = async (id: string) => {
    const token = localStorage.getItem("jwtToken");

    const res = await fetch(`/api/conversation/${id}`, {
      headers: { Authorization: `Bearer ${token}` }  // ⬅ 변경된 부분
    });

    setMessages(await res.json());
    setCurrentId(id);
  };


  /** 🔥 3) 메시지 전송 + SSE */
  const send = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem("jwtToken");

    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`  // ⬅ 변경된 부분
      },
      body: JSON.stringify({ message: input, conversationId: currentId })
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let convId = currentId;

    /** 사용자 메시지 즉시 표시 */
    setMessages(prev => [
      ...prev,
      { rawMessage: input, senderType: "USER", conversationId: convId ?? "temp" }
    ]);
    setInput("");


    /** SSE AI 응답 스트림 */
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);

      // 최초 event: conversationId → 신규 대화 ID
      if (text.includes("conversationId") && !currentId) {
        convId = text.replace("event: conversationId\ndata:", "").trim();
        setCurrentId(convId);
      }

      setMessages(prev => [
        ...prev,
        { senderType: "AI", rawMessage: text, conversationId: convId ?? "NOID" }
      ]);

      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    loadChatHistory(); // 신규 채팅 리스트 갱신
  };


  /** 첫 로딩 시 채팅 목록 자동 로드 */
  useEffect(() => { loadChatHistory(); }, []);


  return (
    <div className="flex h-screen bg-[#fffaf3] text-gray-800">

      {/* 🔥 사이드바 + 선택 기능 */}
      <ChatSidebar
        chatList={chatList}
        currentId={currentId}
        select={loadConversation}
      />

      {/* 🔥 오른쪽 메인 */}
      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <EmptyState input={input} setInput={setInput} send={send}/>
        ) : (
          <>
            <ChatWindow messages={messages} scrollRef={scrollRef}/>
            <ChatInput input={input} setInput={setInput} send={send}/>
          </>
        )}
      </main>

    </div>
  );
}
