interface Props {
  input:string;
  setInput:(v:string)=>void;
  send:(v?:string)=>void;
}

export default function EmptyState({input,setInput,send}:Props){

  const suggestions=[
    "브러시가 작동이 안돼",
    "회사 정보 알려줘",
    "로봇 크기와 무게가 어떻게 되나요?",
    "소모품은 어디서 구입하나요?",
    "사용 방법이 궁금해"
  ];

  const select=(t:string)=>{ setInput(t); send(t); };

  return(
    <div className="flex flex-col items-center pt-65 bg-white min-h-full">

      <h1 className="text-[22px] font-semibold mb-6">
        안녕하세요. 무엇을 도와드릴까요?
      </h1>

      <div className="w-[900px] rounded-2xl border shadow-sm p-5 bg-white">
        <textarea
          placeholder="내용을 입력해주세요."
          value={input}
          onChange={e=>setInput(e.target.value)}
          className="w-full h-[140px] resize-none outline-none text-[15px]"
        />
        <button onClick={()=>send(input)} 
          className="float-right bg-orange-500 text-white px-4 py-2 rounded-lg mt-3">
          확인
        </button>
      </div>

      <div className="w-[900px] rounded-2xl border shadow-sm bg-white py-4 px-6 space-y-3">
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>select(s)} 
            className="flex gap-2 hover:text-orange-600 text-[15px]">
            🔍 {s}
          </button>
        ))}
      </div>

    </div>
  )
}
