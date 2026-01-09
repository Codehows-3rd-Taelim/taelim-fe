import { useCallback, useEffect, useState } from "react";
import type { Qna } from "../type";
import {
  getQnaAll,
  getQnaUnresolved,
  getQnaResolved,
  getQnaApplied,
  getQnaInactive,
  applyQna,
  saveDisplayAnswer,
  updateDisplayAnswer,
  deleteAppliedAnswer,
  deleteQna,
  deleteInactiveQna,
  restoreQna,
} from "./api/qnaApi";

type Tab = "ALL" | "UNRESOLVED" | "RESOLVED" | "INACTIVE";
type ResolvedView = "ALL" | "APPLIED" | "NOT_APPLIED";

export default function QAPage() {
  const [tab, setTab] = useState<Tab>("UNRESOLVED");
  const [resolvedView, setResolvedView] =
    useState<ResolvedView>("ALL");

  const [qnas, setQnas] = useState<Qna[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  // 조회
  const fetchQna = useCallback(async () => {
    setLoading(true);
    let data: Qna[] = [];

    if (tab === "ALL") {
      data = await getQnaAll();
    } else if (tab === "UNRESOLVED") {
      data = await getQnaUnresolved();
    } else if (tab === "RESOLVED") {
      if (resolvedView === "APPLIED") {
        data = await getQnaApplied();
      } else {
        data = await getQnaResolved();
        if (resolvedView === "NOT_APPLIED") {
          data = data.filter((q) => q.status !== "APPLIED");
        }
      }
    } else {
      data = await getQnaInactive();
    }

    setQnas(data);
    setLoading(false);
  }, [tab, resolvedView]);

  useEffect(() => {
    fetchQna();
    setOpenId(null);
  }, [fetchQna]);


  // 상태 배지 (디자인 핵심)
  const getStatusBadge = (q: Qna) => {
    if (q.status === "FAILED") {
      return { label: "답변 적용 실패", color: "bg-red-500" };
    }
    if (q.status === "APPLIED") {
      return { label: "챗봇 적용", color: "bg-blue-500" };
    }
    if (q.resolved) {
      return { label: "처리", color: "bg-green-500" };
    }
    return { label: "미처리", color: "bg-gray-400" };
  };

  const toggle = (q: Qna) => {
    setOpenId((prev) => (prev === q.id ? null : q.id));
    setAnswers((prev) => ({
      ...prev,
      [q.id]:
        q.displayAnswer ??
        q.appliedAnswer ??
        q.editingAnswer ??
        "",
    }));
  };


  const handleApply = async (q: Qna) => {
    if (!confirm("챗봇에 답변을 적용하시겠습니까?")) return;
    try {
      setSubmitting(true);
      await applyQna(q.id, answers[q.id]);
      await fetchQna();
      setOpenId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDisplay = async (q: Qna) => {
    if (!confirm("표시될 답변을 저장하시겠습니까?")) return;
    if (q.resolved) {
      await updateDisplayAnswer(q.id, answers[q.id]);
    } else {
      await saveDisplayAnswer(q.id, answers[q.id]);
    }
    await fetchQna();
  };

  const handleDeleteApplied = async (q: Qna) => {
    if (!confirm("챗봇 답변을 삭제하시겠습니까?")) return;
    await deleteAppliedAnswer(q.id);
    await fetchQna();
  };

  const handleDelete = async (q: Qna) => {
    if (!confirm("질문을 비활성 처리하시겠습니까?")) return;
    await deleteQna(q.id);
    await fetchQna();
  };

  const handleHardDelete = async (q: Qna) => {
    if (!confirm("이 질문을 완전히 삭제합니다. 계속하시겠습니까?"))
      return;
    await deleteInactiveQna(q.id);
    await fetchQna();
  };

  const handleRestore = async (q: Qna) => {
    await restoreQna(q.id);
    await fetchQna();
  };

  if (loading) return <div className="p-6">로딩중...</div>;


  return (
    <div className="p-6 bg-gray-100 h-full">
      <h2 className="text-lg font-bold mb-4">QnA 관리자</h2>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          ["ALL", "전체"],
          ["UNRESOLVED", "미처리"],
          ["RESOLVED", "처리"],
          ["INACTIVE", "비활성 질문"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as Tab)}
            className={`px-3 py-1 rounded ${
              tab === k
                ? "bg-slate-700 text-white"
                : "bg-gray-200"
            }`}
          >
            {l}
          </button>
        ))}

        {tab === "RESOLVED" && (
          <select
            value={resolvedView}
            onChange={(e) =>
              setResolvedView(e.target.value as ResolvedView)
            }
            className="ml-3 px-2 py-1 border rounded"
          >
            <option value="ALL">전체</option>
            <option value="APPLIED">챗봇 적용</option>
            <option value="NOT_APPLIED">챗봇 미적용</option>
          </select>
        )}
      </div>

      {/* 리스트 */}
      <div className="space-y-3">
        {qnas.map((q) => {
          const badge = getStatusBadge(q);

          return (
            <div key={q.id} className="bg-white rounded shadow">
              <button
                onClick={() => toggle(q)}
                className="w-full text-left px-4 py-3"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs flex items-center gap-1 shrink-0">
                    [
                    <span
                      className={`w-2 h-2 rounded-full ${badge.color}`}
                    />
                    {badge.label}]
                  </span>

                  {q.deletedAt && (
                    <span className="text-xs text-gray-400">
                      (비활성)
                    </span>
                  )}

                  <span className="truncate">
                    {q.questionText}
                  </span>
                </div>
              </button>

              {openId === q.id && (
                <div className="px-4 pb-4 border-t space-y-2">
                  <textarea
                    className="w-full border rounded p-2 min-h-24"
                    value={answers[q.id]}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    readOnly={q.deletedAt !== null}
                  />

                  {!q.deletedAt && (
                    <>
                      <button
                        onClick={() => handleSaveDisplay(q)}
                        className="px-3 py-1 bg-slate-600 text-white rounded"
                      >
                        표시될 답변 저장/수정
                      </button>

                      {q.status !== "APPLIED" && (
                        <button
                          disabled={submitting}
                          onClick={() => handleApply(q)}
                          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          챗봇 답변 적용
                        </button>
                      )}

                      {q.status === "APPLIED" && (
                        <button
                          onClick={() => handleDeleteApplied(q)}
                          className="ml-2 px-3 py-1 bg-orange-600 text-white rounded"
                        >
                          챗봇 답변 삭제
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(q)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded"
                      >
                        질문 삭제
                      </button>
                    </>
                  )}

                  {q.deletedAt && (
                    <>
                      <button
                        onClick={() => handleRestore(q)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        복구
                      </button>
                      <button
                        onClick={() => handleHardDelete(q)}
                        className="ml-2 px-3 py-1 bg-red-700 text-white rounded"
                      >
                        질문 삭제 (비활성)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
