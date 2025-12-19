import { useState } from "react";

const questions = [
  "로봇이 바닥 종류를 인식할 때 센서 오차율은?",
  "회사에서 받은 연봉이나 인사 기록 확인 가능?",
  "물걸레 청소 후 바닥이 안 마르는 이유",
  "배터리 완전 방전 시 장기 영향",
];

export default function QAPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-bold text-lg mb-4">미응답 질문</h2>

      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="bg-white rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-4 py-3 flex justify-between items-center"
            >
              <span>{q}</span>
              <span>{openIndex === i ? "▲" : "▼"}</span>
            </button>

            {openIndex === i && (
              <div className="px-4 pb-4">
                <input
                  placeholder="답변 추가"
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                <button className="bg-orange-500 text-white px-4 py-1 rounded">
                  등록
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
