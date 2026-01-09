import { useCallback, useEffect, useState } from "react";
import type { Qna } from "../type";
import {
  applyQna,
  deleteQna,
  getQnaAll,
  getQnaResolved,
  getQnaUnresolved,
  createQna,
} from "./api/qnaApi";

type Filter = "ALL" | "UNRESOLVED" | "RESOLVED";

export default function QnaPage() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("UNRESOLVED");
  const [openId, setOpenId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 질문 등록 모달
  const [createOpen, setCreateOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");

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
    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0"
    )} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
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
    setAnswers((prev) => ({
      ...prev,
      [q.id]:
        q.status === "FAILED"
          ? q.editingAnswer ?? ""
          : q.appliedAnswer ?? "",
    }));
  };

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2">
        {/* 헤더 */}
        <h2 className="font-bold text-lg my-5 ml-6">QnA 관리</h2>

        {/* 필터 + 질문 등록 */}
        <div className="flex items-center justify-between ml-6 mb-5 mr-6">
          <div className="flex gap-1">
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

          <button
            onClick={() => {
              setNewQuestion("");
              setCreateOpen(true);
            }}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-[#4A607A] rounded-lg hover:bg-[#324153]"
          >
            + 질문 등록
          </button>
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
                  <div className="text-xs text-gray-500 mb-1">
                    질문: {formatDate(q.createdAt)}
                    {isResolved && q.updatedAt && (
                      <span className="ml-4">
                        답변: {formatDate(q.updatedAt)}
                      </span>
                    )}
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

        {/* 질문 등록 모달 */}
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">질문 등록</h3>

              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="질문을 입력하세요"
                className="w-full border rounded p-3 min-h-[120px]"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-1 rounded bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    if (!newQuestion.trim()) {
                      alert("질문을 입력해주세요.");
                      return;
                    }
                    await createQna(newQuestion.trim());
                    setCreateOpen(false);
                    await fetchQna();
                    setFilter("UNRESOLVED");
                    setToast("질문이 등록되었습니다.");
                  }}
                  className="px-4 py-1 rounded bg-[#4A607A] text-white"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-[22%] left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded shadow">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
