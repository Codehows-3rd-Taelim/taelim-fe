import { useEffect, useState, useCallback } from "react";
import type { Qna } from "../type";
import {
  getQnaAll,
  getQnaResolved,
  getQnaUnresolved,
  updateUserQuestion,
  deleteUserQuestion,
  createQna,
} from "./api/qnaApi";

type Filter = "ALL" | "UNRESOLVED" | "RESOLVED";


const badgeBase =
  "text-xs px-2 py-0.5 rounded text-white whitespace-nowrap";

const userStatusBadge = (q: Qna) => {
  const hasAnswer = Boolean(q.displayAnswer?.trim());
  return hasAnswer ? (
    <span className={`${badgeBase} bg-green-600`}>답변 완료</span>
  ) : (
    <span className={`${badgeBase} bg-gray-400`}>처리중</span>
  );
};

const inputBase =
  "w-full rounded-md px-3 py-2 focus:outline-none transition";

const textareaBase =
  "w-full rounded-md px-3 py-2 min-h-24 resize-none focus:outline-none transition";

const readOnlyStyle = "bg-gray-100 text-gray-800";

const editableStyle =
  "bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-slate-400";


export default function UserQnaPage() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("UNRESOLVED");

  const [openId, setOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [titles, setTitles] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")} ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };


  const fetchQnas = useCallback(
    async (targetFilter: Filter = filter) => {
      setLoading(true);

      const data =
        targetFilter === "ALL"
          ? await getQnaAll()
          : targetFilter === "RESOLVED"
          ? await getQnaResolved()
          : await getQnaUnresolved();

      setQnas(data);
      setOpenId(null);
      setEditingId(null);
      setTitles(Object.fromEntries(data.map((q) => [q.id, q.title])));
      setAnswers(
        Object.fromEntries(data.map((q) => [q.id, q.questionText]))
      );

      setLoading(false);
    },
    [filter]
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
    });

    (async () => {
      const data =
        filter === "ALL"
          ? await getQnaAll()
          : filter === "RESOLVED"
          ? await getQnaResolved()
          : await getQnaUnresolved();

      queueMicrotask(() => {
        if (cancelled) return;

        setQnas(data);
        setOpenId(null);
        setEditingId(null);
        setTitles(Object.fromEntries(data.map((q) => [q.id, q.title])));
        setAnswers(
          Object.fromEntries(data.map((q) => [q.id, q.questionText]))
        );
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);


  const toggle = (q: Qna) => {
    if (editingId === q.id) return;

    setOpenId((p) => (p === q.id ? null : q.id));
    setEditingId(null);
  };

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <>
      <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
        <div className="w-full max-w-[1400px] px-6 pt-4">
          <h2 className="font-bold text-lg my-5">QnA 관리</h2>

          {/* ===== 탭 ===== */}
          <div className="flex gap-2 mb-4">
            {[
              { key: "ALL", label: "전체" },
              { key: "UNRESOLVED", label: "미처리" },
              { key: "RESOLVED", label: "처리완료" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key as Filter)}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  filter === t.key
                    ? "bg-slate-700 text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ===== 질문 등록 버튼 ===== */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm"
            >
              질문 등록
            </button>
          </div>

          {/* ===== 리스트 ===== */}
          <div className="space-y-4">
            {qnas.map((q) => {
              const isOpen = openId === q.id;
              const isEditing = editingId === q.id;
              const canEdit = q.displayAnswer == null;

              return (
                <div key={q.id} className="bg-white rounded-xl shadow-sm">
                  {/* ===== 상단 ===== */}
                  <button
                    onClick={() => toggle(q)}
                    className={`w-full px-5 py-4 text-left ${
                      isEditing ? "cursor-default" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      {userStatusBadge(q)}
                      <span>{formatDate(q.createdAt)}</span>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-1">
                        질문 제목
                      </div>
                      <input
                        value={titles[q.id] ?? ""}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setTitles((p) => ({
                            ...p,
                            [q.id]: e.target.value,
                          }))
                        }
                        className={`${inputBase} ${
                          isEditing ? editableStyle : readOnlyStyle
                        }`}
                      />
                    </div>
                  </button>

                  {/* ===== 상세 ===== */}
                  <div
                    className={`overflow-hidden transition-[max-height] duration-200 ${
                      isOpen ? "max-h-[800px]" : "max-h-0"
                    }`}
                  >
                    <div className="px-5 pb-5 space-y-4">
                      {/* 질문 내용 */}
                      <div>
                        <div className="text-sm font-semibold mb-1">
                          질문 내용
                        </div>
                        <textarea
                          value={answers[q.id] ?? ""}
                          readOnly={!isEditing}
                          onChange={(e) =>
                            setAnswers((p) => ({
                              ...p,
                              [q.id]: e.target.value,
                            }))
                          }
                          className={`${textareaBase} ${
                            isEditing ? editableStyle : readOnlyStyle
                          }`}
                        />
                      </div>

                      {/* 답변 */}
                      {q.displayAnswer && (
                        <div>
                          <div className="text-sm font-semibold mb-1">
                            답변
                          </div>
                          <div className="bg-blue-50 rounded-md p-3 whitespace-pre-wrap text-sm">
                            {q.displayAnswer}
                          </div>
                        </div>
                      )}

                      {/* 버튼 */}
                      {canEdit && (
                        <div className="flex gap-2 pt-2">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => setEditingId(q.id)}
                                className="px-4 py-1.5 rounded-md bg-slate-600 text-white"
                              >
                                수정
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("질문을 삭제하시겠습니까?"))
                                    return;
                                  await deleteUserQuestion(q.id);
                                  setToast("질문이 삭제되었습니다.");
                                  await fetchQnas(); 
                                }}
                                className="px-4 py-1.5 rounded-md bg-red-500 text-white"
                              >
                                삭제
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                disabled={submitting}
                                onClick={async () => {
                                  if (!confirm("질문을 수정하시겠습니까?"))
                                    return;
                                  setSubmitting(true);
                                  await updateUserQuestion(q.id, {
                                    title: titles[q.id],
                                    questionText: answers[q.id],
                                  });
                                  setSubmitting(false);
                                  setEditingId(null);
                                  setToast("질문이 수정되었습니다.");
                                  await fetchQnas(); 
                                }}
                                className="px-4 py-1.5 rounded-md bg-[#4A607A] text-white"
                              >
                                저장
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm("수정을 취소하시겠습니까?"))
                                    return;
                                  setEditingId(null);
                                }}
                                className="px-4 py-1.5 rounded-md bg-gray-200"
                              >
                                취소
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* ===== 질문 등록 모달 ===== */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-lg font-bold">질문 등록</h3>

            <div>
              <div className="text-sm font-semibold mb-1">질문 제목</div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`${inputBase} ${editableStyle}`}
              />
            </div>

            <div>
              <div className="text-sm font-semibold mb-1">질문 내용</div>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className={`${textareaBase} ${editableStyle}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  if (!confirm("등록을 취소하시겠습니까?")) return;
                  setCreateOpen(false);
                }}
                className="px-4 py-1.5 rounded-md bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!confirm("질문을 등록하시겠습니까?")) return;
                  await createQna({
                    title: newTitle,
                    questionText: newQuestion,
                  });
                  setToast("질문이 등록되었습니다.");
                  setCreateOpen(false);
                  setNewTitle("");
                  setNewQuestion("");
                  await fetchQnas(); 
                }}
                className="px-4 py-1.5 rounded-md bg-slate-700 text-white"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
