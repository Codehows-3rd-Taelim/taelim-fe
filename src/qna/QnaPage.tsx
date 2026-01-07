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

export default function QnaPage() {
  /** ---------------- QAPage 로직 ---------------- */
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("UNRESOLVED");
  const [openId, setOpenId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const statusMap: Record<
    "APPLIED" | "FAILED" | "NONE",
    { label: string; color: string }
  > = {
    NONE: { label: "미처리", color: "bg-gray-400" },
    APPLIED: { label: "완료", color: "bg-green-500" },
    FAILED: { label: "실패", color: "bg-red-500" },
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

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
        [q.id]:
          q.status === "FAILED" ? q.editingAnswer ?? "" : q.appliedAnswer ?? "",
      }));
    }
  };

  if (loading) return <div className="p-6">로딩중...</div>;

  /** ---------------- EmbeddingPage 레이아웃 ---------------- */
  return (
    <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2 pb-0">
        {/* 탭처럼 보이는 상단 영역 (Q&A만) */}
        <div className="flex px-4 pt-6 bg-gray-100 border-b-2 border-gray-400 sm:px-6">
          <div
            className="px-4 py-2 font-semibold bg-[#4A607A] text-white border border-b-0 border-[#4A607A]"
            style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
          >
            Q&A
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 border border-gray-300 border-t-0 p-4 bg-white overflow-auto min-h-[400px]">
          <h2 className="font-bold text-lg my-5 ml-6">QnA 관리</h2>

          {/* 필터 */}
          <div className="flex gap-1 ml-6 mb-5">
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
                    ? "bg-[#4A607A] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 리스트 */}
          <div className="px-6 space-y-3">
            {qnas.map((q) => {
              const isResolved = q.resolved === true;
              const status = statusMap[q.status ?? "NONE"];

              return (
                <div key={q.id} className="bg-white rounded-lg border">
                  <button
                    onClick={() => toggle(q)}
                    className="w-full px-4 py-3 text-left font-medium"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        질문: {formatDate(q.createdAt)}
                        {isResolved && q.updatedAt && (
                          <span className="ml-4">
                            답변: {formatDate(q.updatedAt)}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs flex items-center gap-1">
                        [
                        <span
                          className={`w-2 h-2 rounded-full ${status.color}`}
                        />
                        {status.label}]
                      </span>
                      <span>{q.questionText}</span>
                    </div>
                  </button>

                  {openId === q.id && (
                    <div className="px-4 pb-4">
                      <textarea
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((p) => ({
                            ...p,
                            [q.id]: e.target.value,
                          }))
                        }
                        className="w-full border rounded px-3 py-2 mb-3 min-h-24"
                      />

                      <button
                        disabled={submitting}
                        onClick={async () => {
                          if (!confirm("저장하시겠습니까?")) return;
                          try {
                            setSubmitting(true);
                            await applyQna(q.id, answers[q.id]);
                            await fetchQna();
                            setToast("저장되었습니다.");
                            setOpenId(null);
                          } catch {
                            setToast("실패했습니다.");
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        className="px-4 py-1 rounded text-white bg-[#324153]"
                      >
                        저장
                      </button>

                      <button
                        className="ml-3 px-4 py-1 rounded text-white bg-red-500"
                        onClick={() => {
                          if (!confirm("삭제하시겠습니까?")) return;
                          deleteQna(q.id).then(fetchQna);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {toast && (
            <div className="fixed top-[22%] left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded shadow">
              {toast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
