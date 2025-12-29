import { useCallback, useEffect, useState } from "react";
import type { Qna } from "../../type";
import {
  applyQna,
  deleteQna,
  getQnaAll,
  getQnaResolved,
  getQnaUnresolved,
} from "../api/qnaEmbeddingApi";

type Filter = "ALL" | "UNRESOLVED" | "RESOLVED";

export default function QAPage() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("UNRESOLVED");
  const [openId, setOpenId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const deleteData = (id: number) => {
    if(confirm("질문을 삭제하시겠습니까?")) {
        deleteQna(id)
        .then(() => {
          fetchQna();
          alert("질문이 삭제되었습니다.")
        })
        .catch(err => console.log(err));
    }
  }
  
  const fetchQna = useCallback(async () => {
    setLoading(true);

    const data =
      filter === "ALL"
        ? await getQnaAll()
        : filter === "RESOLVED"
        ? await getQnaResolved()
        : await getQnaUnresolved();

    setQnas(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchQna();
    setOpenId(null);
  }, [fetchQna]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (q: Qna) => {
    setOpenId((prev) => (prev === q.id ? null : q.id));

    if (!answers[q.id]) {
      setAnswers((prev) => ({
        ...prev,
        [q.id]: q.appliedAnswer ?? "",
      }));
    }
  };

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <h2 className="font-bold text-lg mb-5 ml-10 mt-5">QnA 관리</h2>

      {/* 필터 */}
      <div className="flex gap-1 ml-10">
        {[
          { key: "ALL", label: "전체" },
          { key: "UNRESOLVED", label: "미처리" },
          { key: "RESOLVED", label: "처리완료" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as Filter)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f.key
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="p-4 space-y-3">
        {qnas.map((q) => {
          const isResolved = q.resolved === true;

          return (
            <div key={q.id} className="bg-white rounded-lg">
              <button
                onClick={() => toggle(q)}
                className="w-full px-4 py-3 text-left font-medium flex justify-between"
              >
                <span>{q.questionText}</span>
                {isResolved && (
                  <span className="text-xs text-gray-400">수정</span>
                )}
              </button>

              {openId === q.id && (
                <div className="px-4 pb-4">
                  <textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="답변을 입력하세요"
                    className="w-full border rounded px-3 py-2 mb-3 min-h-24"
                  />

                  <button
                    disabled={submitting}
                    onClick={async () => {
                      const confirmMessage = isResolved
                        ? "수정 내용을 저장하시겠습니까?"
                        : "저장하시겠습니까?\n저장 후 즉시 반영됩니다.";

                      if (!window.confirm(confirmMessage)) return;

                      try {
                        setSubmitting(true);
                        await applyQna(q.id, answers[q.id]);
                        setToast(
                          isResolved
                            ? "QnA가 수정되었습니다."
                            : "QnA가 저장되었습니다."
                        );
                        await fetchQna();
                        setOpenId(null);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="px-4 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isResolved ? "수정" : "저장"}
                  </button>

                  <button
                    className="ml-3 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                    onClick={() => deleteData(q.id)}
                  >
                    삭제
                  </button>

                </div>
              )}
            </div>
          );
        })}

        {qnas.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            표시할 QnA가 없습니다
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-[22%] left-[58%] -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
