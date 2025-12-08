interface Props {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
}

export default function ChatInput({ input, setInput, send }: Props) {
  return (
    <div className="p-5 border-t flex gap-3 bg-white">
      <textarea 
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        className="flex-1 p-3 border rounded-lg resize-none"
        placeholder="메시지를 입력하세요."
      />
      <button
        onClick={send}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
      >
        확인
      </button>
    </div>
  );
}
