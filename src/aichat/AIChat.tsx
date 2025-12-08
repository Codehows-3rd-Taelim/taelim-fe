import { useEffect, useRef, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import EmptyState from "./EmptyState";

export default function AIChat() {

  const [chatList, setChatList] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** 채팅 목록 */
  const loadChatHistory = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;
    const res = await fetch("/api/chat-history", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setChatList(await res.json());
  };

  /** 대화 불러오기 */
  const loadConversation = async (id: string) => {
    setCurrentId(id);
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(`/api/conversation/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages(await res.json());
    setTimeout(()=>scrollRef.current?.scrollIntoView({behavior:"smooth"}),80)
  };

  /** 메시지 전송 */
  const send = async (text?:string) => {
    const message = text ?? input;
    if(!message.trim()) return;

    const token = localStorage.getItem("jwtToken");
    const response = await fetch("/api/agent/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify({ message,conversationId:currentId })
    });

    const reader=response.body?.getReader(); if(!reader) return;
    const decoder=new TextDecoder(); let conv=currentId;

    setMessages(p=>[...p,{rawMessage:message,senderType:"USER"}]);
    setInput("");

    while(true){
      const {value,done}=await reader.read();
      if(done) break;
      const textChunk=decoder.decode(value);

      if(textChunk.includes("conversationId")&&!currentId){
        conv=textChunk.replace("event: conversationId\ndata:","").trim();
        setCurrentId(conv);
      }

      setMessages(p=>[...p,{rawMessage:textChunk,senderType:"AI"}]);
      scrollRef.current?.scrollIntoView({behavior:"smooth"});
    }
    loadChatHistory();
  };

  useEffect(()=>{ loadChatHistory(); },[]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <ChatSidebar chatList={chatList} currentId={currentId} select={loadConversation}/>
      
      {/* 메시지 없으면 EmptyState, 있으면 ChatWindow */}
      <div className="flex-1 bg-white">
        {messages.length===0 
          ? <EmptyState input={input} setInput={setInput} send={send}/>
          : <ChatWindow messages={messages} input={input} setInput={setInput} send={send} scrollRef={scrollRef}/>
        }
      </div>
    </div>
  );
}
