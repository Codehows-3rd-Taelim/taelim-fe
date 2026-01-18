import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import type { Qna, PaginationResponse, QnaViewType } from "../../type";
import {
  getQnaPage,
  updateUserQuestion,
  deleteUserQuestion,
  createQna,
} from "../api/qnaApi";

const PAGE_SIZE = 10;


const badgeBase = "text-xs px-2 py-0.5 rounded text-white whitespace-nowrap";

const userStatusBadge = (q: Qna) =>
  q.displayAnswer ? (
    <span className={`${badgeBase} bg-green-600`}>답변 완료</span>
  ) : (
    <span className={`${badgeBase} bg-gray-400`}>처리중</span>
  );

const inputBase = "w-full rounded-md px-3 py-2 focus:outline-none transition";

const textareaBase =
  "w-full rounded-md px-3 py-2 min-h-24 resize-none focus:outline-none transition";

const readOnlyStyle = "bg-gray-100 text-gray-800";
const editableStyle =
  "bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-slate-400";


const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const isBlank = (v: string) => v.trim().length === 0;


export default function UserQnaPage() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewType, setViewType] = useState<QnaViewType>("ALL");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [reloadKey, setReloadKey] = useState(0);

  const [openId, setOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [originTitles, setOriginTitles] = useState<Record<number, string>>({});
  const [originAnswers, setOriginAnswers] = useState<Record<number, string>>(
    {}
  );

  const [titles, setTitles] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");


  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      const res: PaginationResponse<Qna> = await getQnaPage(
        viewType,
        page,
        PAGE_SIZE
      );

      if (cancelled) return;

      setQnas(res.content);
      setTotalPages(res.totalPages);
      setOpenId(null);
      setEditingId(null);

      const t = Object.fromEntries(res.content.map((q) => [q.id, q.title]));
      const a = Object.fromEntries(
        res.content.map((q) => [q.id, q.questionText])
      );

      setOriginTitles(t);
      setOriginAnswers(a);
      setTitles(t);
      setAnswers(a);

      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [viewType, page, reloadKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (q: Qna) => {
    if (editingId === q.id) return;

    setOpenId((prev) => {
      const next = prev === q.id ? null : q.id;

      if (next !== null) {
        setTitles((p) => ({ ...p, [q.id]: originTitles[q.id] ?? q.title }));
        setAnswers((p) => ({
          ...p,
          [q.id]: originAnswers[q.id] ?? q.questionText,
        }));
        setEditingId(null);
      }

      return next;
    });
  };

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <>
      <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
        <div className="w-full max-w-[1400px] px-6 pt-4">
          <h2 className="font-bold text-lg my-5">Q&A</h2>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[
                ["ALL", "전체"],
                ["UNRESOLVED", "처리중"],
                ["RESOLVED", "처리완료"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => {
                    setViewType(k as QnaViewType);
                    setPage(0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm ${
                    viewType === k
                      ? "bg-slate-700 text-white"
                      : "bg-white border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm"
            >
              질문 등록
            </button>
          </div>

          {qnas.length === 0 ? (
            <div className="py-24 text-center text-gray-400">
              등록된 Q&A가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {qnas.map((q) => {
                const isOpen = openId === q.id;
                const isEditing = editingId === q.id;
                const canEdit = q.displayAnswer == null;

                return (
                  <div key={q.id} className="bg-white rounded-xl shadow-sm">
                    <button
                      onClick={() => toggle(q)}
                      className="w-full px-5 py-4 text-left hover:bg-gray-50
                      focus:outline-none focus:ring-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {userStatusBadge(q)}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(q.createdAt)}
                        </span>
                      </div>

                      <div className="text-sm font-semibold mb-1">제목</div>
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
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 space-y-4">
                        <div>
                          <div className="text-sm font-semibold mb-1">내용</div>
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

                        {q.displayAnswer && (
                          <div>
                            <div className="text-sm font-semibold mb-1">
                              답변
                            </div>
                            <div className="bg-blue-50 rounded-md p-3 text-sm whitespace-pre-wrap">
                              {q.displayAnswer}
                            </div>
                          </div>
                        )}

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
                                    setPage(0);
                                    setReloadKey((k) => k + 1);
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
                                    if (
                                      isBlank(titles[q.id]) ||
                                      isBlank(answers[q.id])
                                    ) {
                                      alert("공백만 입력할 수 없습니다.");
                                      return;
                                    }
                                    if (!confirm("질문을 수정하시겠습니까?"))
                                      return;

                                    setSubmitting(true);
                                    await updateUserQuestion(q.id, {
                                      title: titles[q.id],
                                      questionText: answers[q.id],
                                    });
                                    setSubmitting(false);

                                    setOriginTitles((p) => ({
                                      ...p,
                                      [q.id]: titles[q.id],
                                    }));
                                    setOriginAnswers((p) => ({
                                      ...p,
                                      [q.id]: answers[q.id],
                                    }));

                                    setEditingId(null);
                                    setToast("질문이 수정되었습니다.");
                                  }}
                                  className="px-4 py-1.5 rounded-md bg-[#4A607A] text-white"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() => {
                                    if (!confirm("수정을 취소하시겠습니까?"))
                                      return;

                                    setTitles((p) => ({
                                      ...p,
                                      [q.id]: originTitles[q.id],
                                    }));
                                    setAnswers((p) => ({
                                      ...p,
                                      [q.id]: originAnswers[q.id],
                                    }));
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
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 mb-24">
              <Pagination
                page={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}

          {toast && (
            <div className="fixed top-[22%] left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded shadow">
              {toast}
            </div>
          )}
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-3xl min-h-[520px] rounded-2xl px-10 py-8 shadow-xl flex flex-col">
            <h3 className="text-xl font-bold mb-4">질문 등록</h3>

            <input
              placeholder="제목을 입력하세요 (50자 이내)"
              value={newTitle}
              maxLength={50}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`${inputBase} ${editableStyle} mb-4`}
            />

            <textarea
              placeholder="내용을 입력하세요"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className={`${textareaBase} ${editableStyle} flex-1 min-h-[220px]`}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  if (!confirm("질문 등록을 취소하시겠습니까?")) return;
                  setCreateOpen(false);
                  setNewTitle("");
                  setNewQuestion("");
                }}
                className="px-5 py-2 rounded-md bg-gray-200"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  if (!newTitle.trim() || !newQuestion.trim()) {
                    alert("제목과 내용을 입력하세요");
                    return;
                  }

                  if (
                    !confirm(
                      "질문을 등록하시겠습니까?\n질문에 답변이 달린 이후에는 수정 및 삭제가 불가능합니다."
                    )
                  )
                    return;

                  await createQna({
                    title: newTitle.trim(),
                    questionText: newQuestion.trim(),
                  });

                  setToast("질문이 등록되었습니다.");
                  setCreateOpen(false);
                  setNewTitle("");
                  setNewQuestion("");
                  setPage(0);
                  setReloadKey((k) => k + 1);
                }}
                className="px-5 py-2 rounded-md bg-slate-700 text-white"
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
