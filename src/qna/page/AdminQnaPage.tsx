import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination";
import type { Qna, PaginationResponse, QnaViewType } from "../../type";
import {
  getQnaPage,
  applyQna,
  saveDisplayAnswer,
  updateDisplayAnswer,
  deleteAppliedAnswer,
  deleteQna,
  deleteInactiveQna,
  restoreQna,
} from "../api/qnaApi";



type ResolvedView = "ALL" | "APPLIED" | "NOT_APPLIED";

const PAGE_SIZE = 10;


const textareaClass = (editable: boolean) =>
  `w-full max-w-full box-border border rounded p-2 min-h-24 resize-none ${
    editable
      ? "bg-white border-slate-400"
      : "bg-gray-100 border-gray-200 text-gray-700"
  }`;

const btn = "px-3 py-1 rounded text-white";
const btnDisabled =
  "px-3 py-1 rounded bg-gray-300 text-gray-500 cursor-not-allowed";

const badgeBase =
  "text-xs px-2 py-0.5 rounded text-white whitespace-nowrap";

const statusBadge = (q: Qna) => {
  if (q.deletedAt)
    return <span className={`${badgeBase} bg-black`}>비활성</span>;
  if (!q.resolved)
    return <span className={`${badgeBase} bg-gray-400`}>미처리</span>;
  if (q.status === "APPLIED")
    return <span className={`${badgeBase} bg-blue-500`}>챗봇 적용</span>;
  if (q.status === "FAILED")
    return <span className={`${badgeBase} bg-red-500`}>챗봇 적용 실패</span>;
  return <span className={`${badgeBase} bg-green-600`}>처리</span>;
};

export default function AdminQnaPage() {
  const [viewType, setViewType] =
    useState<QnaViewType>("UNRESOLVED");
  const [resolvedView, setResolvedView] =
    useState<ResolvedView>("ALL");

  const [qnas, setQnas] = useState<Qna[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const [displayAnswers, setDisplayAnswers] =
    useState<Record<number, string>>({});
  const [chatbotAnswers, setChatbotAnswers] =
    useState<Record<number, string>>({});

  const [editingDisplay, setEditingDisplay] =
    useState<Record<number, boolean>>({});
  const [editingChatbot, setEditingChatbot] =
    useState<Record<number, boolean>>({});

  const [toast, setToast] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const toastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };


  useEffect(() => {
    const fetch = async () => {
      const res: PaginationResponse<Qna> =
        await getQnaPage(viewType, page, PAGE_SIZE);
      setQnas(res.content);
      setTotalPages(res.totalPages);
      setOpenId(null);
    };
    fetch();
  }, [viewType, page]);

  const refetch = async () => {
    const res = await getQnaPage(viewType, page, PAGE_SIZE);
    setQnas(res.content);
    setTotalPages(res.totalPages);
  };



  const visibleQnas = useMemo(() => {
    if (viewType !== "RESOLVED") return qnas;

    if (resolvedView === "APPLIED")
      return qnas.filter((q) => q.status === "APPLIED");

    if (resolvedView === "NOT_APPLIED")
      return qnas.filter((q) => q.status !== "APPLIED");

    return qnas;
  }, [qnas, viewType, resolvedView]);

  const toggle = (q: Qna) => {
    setOpenId((p) => (p === q.id ? null : q.id));
    setDisplayAnswers((p) => ({ ...p, [q.id]: q.displayAnswer ?? "" }));
    setChatbotAnswers((p) => ({
      ...p,
      [q.id]:
        q.status === "FAILED"
          ? q.editingAnswer ?? ""
          : q.appliedAnswer ?? "",
    }));

    setEditingDisplay((p) => ({ ...p, [q.id]: false }));
    setEditingChatbot((p) => ({ ...p, [q.id]: false }));
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-md pb-4">
      <div className="bg-gray-100 px-6 py-4 rounded-md">
      
      <h2 className="text-lg font-bold mb-4">QnA</h2>

      {/* ===== 탭 ===== */}
      <div className="flex gap-2 mb-4">
        {[
          ["ALL", "전체"],
          ["UNRESOLVED", "미처리"],
          ["RESOLVED", "처리"],
          ["INACTIVE", "비활성 질문"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => {
              setViewType(k as QnaViewType);
              setPage(0);
            }}
            className={`px-3 py-1 rounded ${
              viewType === k ? "bg-slate-700 text-white" : "bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}

        {viewType === "RESOLVED" && (
          <select
            value={resolvedView}
            onChange={(e) => {
              setResolvedView(e.target.value as ResolvedView);
              setPage(0);
            }}
            className="ml-3 px-2 py-1 border rounded"
          >
            <option value="ALL">전체</option>
            <option value="APPLIED">챗봇 적용</option>
            <option value="NOT_APPLIED">챗봇 미적용</option>
          </select>
        )}
      </div>


      {/* ===== 리스트 ===== */}
    
          <div className="space-y-3">
          {visibleQnas.map((q) => {
            const isInactive = Boolean(q.deletedAt);
            const isUnresolved = !q.resolved;

            const displayValue =
              displayAnswers[q.id] ?? q.displayAnswer ?? "";

            const chatbotValue =
            chatbotAnswers[q.id] ??
           (q.status === "FAILED"
            ? q.editingAnswer ?? ""
            : q.appliedAnswer ?? "");



      const isEditingDisplay = editingDisplay[q.id];
      const isEditingChatbot = editingChatbot[q.id];

          if (isInactive) {
            return (
              <div key={q.id} className="bg-white rounded shadow overflow-hidden">
                <button
                  onClick={() => toggle(q)}
                  className="w-full px-4 py-3 flex gap-2 text-left
                            focus:outline-none focus:ring-0"
                >

                  {statusBadge(q)}
                  <span className="truncate">{q.title}</span>
                </button>

                {openId === q.id && (
                  <div className="px-4 pb-4 pt-4 border-t space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">질문 내용</div>
                      <textarea
                        className={textareaClass(false)}
                        value={q.questionText}
                        readOnly
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        유저 Q&A에 표시될 답변
                      </div>
                      <textarea
                        className={textareaClass(false)}
                        value={displayValue}
                        readOnly
                      />
                    </div>

              

                    <div className="flex gap-2 flex-wrap max-w-full">
                      <button
                        className={`${btn} bg-green-600`}
                        onClick={async () => {
                          await restoreQna(q.id);
                          toastMsg("질문이 복구되었습니다");
                          await refetch();
                        }}
                      >
                        질문 복구
                      </button>
                      <button
                        className={`${btn} bg-red-700`}
                        onClick={async () => {
                          if (!confirm("이 질문을 완전히 삭제합니다.")) return;
                          await deleteInactiveQna(q.id);
                          toastMsg("질문이 완전히 삭제되었습니다");
                          await refetch();
                        }}
                      >
                        질문 완전 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }


          return (
            <div key={q.id} className="bg-white rounded shadow overflow-hidden">
              <button
                onClick={() => toggle(q)}
                className="w-full px-4 py-3 flex gap-2 text-left
                          focus:outline-none focus:ring-0"
              >

                {statusBadge(q)}
                <span className="truncate">{q.title}</span>
              </button>

              {openId === q.id && (
                <div className="px-4 pb-4 pt-4 border-t space-y-4">
                  {/* 1) 질문 내용 */}
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">질문 내용</div>
                    <textarea
                      className={textareaClass(false)}
                      value={q.questionText}
                      readOnly
                    />
                  </div>

                  {/* 2) 유저 표시 답변 */}
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      유저 Q&A에 표시될 답변
                    </div>
                    <textarea
                      className={textareaClass(isUnresolved || isEditingDisplay)}
                      value={displayValue}
                      readOnly={!isUnresolved && !isEditingDisplay}
                      onChange={(e) =>
                        setDisplayAnswers((p) => ({
                          ...p,
                          [q.id]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* 3) 챗봇 적용 답변 */}
                  {!isUnresolved && (
                    <div className="space-y-1">
                     <div
                      className={`text-sm font-semibold ${
                        q.status === "FAILED" ? "text-red-600" : ""
                      }`}
                    >
                      {q.status === "FAILED"
                        ? "마지막 시도한 챗봇 답변 (챗봇 적용 실패 - 다시 시도해주세요)"
                        : "챗봇 적용 답변"}
                    </div>
                      <textarea
                        className={textareaClass(isEditingChatbot)}
                        value={chatbotValue}
                        readOnly={!isEditingChatbot}
                        onChange={(e) =>
                          setChatbotAnswers((p) => ({
                            ...p,
                            [q.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}

                  {/* ===== 버튼 ===== */}
                  <div className="flex gap-2 flex-wrap max-w-full">
                    {isUnresolved && (
                      <>
                        <button
                          className={`${btn} bg-green-600`}
                          onClick={async () => {
                            if (!confirm("답변을 저장하시겠습니까?")) return;
                            await saveDisplayAnswer(q.id, displayValue);
                            toastMsg("답변 저장됨");
                            await refetch();
                          }}
                        >
                          답변 저장
                        </button>

                        <button
                          className={`${btn} bg-red-600`}
                          onClick={async () => {
                            if (!confirm("질문을 비활성 처리하시겠습니까?")) return;
                            await deleteQna(q.id);
                            toastMsg("질문 비활성 처리됨");
                            await refetch();
                          }}
                        >
                          질문 삭제
                        </button>
                      </>
                    )}

                    {!isUnresolved &&
                      !isEditingDisplay &&
                      !isEditingChatbot && (
                        <>
                          <button
                            className={`${btn} bg-green-600`}
                            onClick={() =>
                              setEditingDisplay((p) => ({
                                ...p,
                                [q.id]: true,
                              }))
                            }
                          >
                            답변 수정
                          </button>

                          {q.status === "FAILED" && (
                          <button
                            className={`${btn} bg-yellow-400 hover:bg-yellow-500 text-black`}
                            onClick={async () => {
                              const retryAnswer = chatbotValue.trim();

                              if (!retryAnswer) {
                                alert("재적용할 챗봇 답변이 없습니다.");
                                return;
                              }

                              if (!confirm("이 답변을 다시 챗봇에 적용하시겠습니까?")) return;

                              try {
                                await applyQna(q.id, retryAnswer);
                                toastMsg("챗봇 답변 재적용 요청됨");
                                await refetch();
                              } catch {
                                toastMsg("챗봇 답변 재적용 실패");
                              }
                            }}
                          >
                            챗봇 답변 재적용
                          </button>
                        )}


                        
                          <button
                            className={`${btn} bg-indigo-600`}
                            onClick={() =>
                              setEditingChatbot((p) => ({
                                ...p,
                                [q.id]: true,
                              }))
                            }
                          >
                            챗봇 답변 수정
                          </button>
                        


                          <button
                            disabled={!q.appliedAnswer}
                            className={
                              q.appliedAnswer
                                ? `${btn} bg-orange-600`
                                : btnDisabled
                            }
                            onClick={async () => {
                              if (!confirm("챗봇 답변을 삭제하시겠습니까?")) return;
                              await deleteAppliedAnswer(q.id);
                              setChatbotAnswers((p) => {
                              const next = { ...p };
                              delete next[q.id];
                              return next;
                            });
                              toastMsg("챗봇 답변 삭제됨");
                              await refetch();
                            }}
                          >
                            챗봇 답변 삭제
                          </button>

                          <button
                            disabled={!!q.appliedAnswer}
                            className={
                              q.appliedAnswer ? btnDisabled : `${btn} bg-red-600`
                            }
                            onClick={async () => {
                              if (!confirm("질문을 비활성 처리하시겠습니까?")) return;
                              await deleteQna(q.id);
                              toastMsg("질문 비활성 처리됨");
                              await refetch();
                            }}
                          >
                            질문 삭제
                          </button>
                        </>
                      )}

                    {(isEditingDisplay || isEditingChatbot) && (
                      <>
                        {isEditingDisplay && (
                          <button
                            className={`${btn} bg-green-600`}
                            onClick={async () => {
                              if (!confirm("답변을 저장하시겠습니까?")) return;
                              await updateDisplayAnswer(q.id, displayValue);
                              toastMsg("답변 저장됨");
                              setEditingDisplay((p) => ({
                                ...p,
                                [q.id]: false,
                              }));
                              await refetch();
                            }}
                          >
                            답변 저장
                          </button>
                        )}

                        {isEditingChatbot && (
                          <button
                            className={`${btn} bg-blue-600`}
                            onClick={async () => {
                              if (!chatbotValue || chatbotValue.trim().length === 0) {
                                alert("챗봇 답변을 입력해주세요. 공백은 불가능합니다.");
                                return;
                              }

                              if (!confirm("챗봇 답변을 적용하시겠습니까?")) return;

                              await applyQna(q.id, chatbotValue.trim());
                              toastMsg("챗봇 답변 적용됨");
                              setEditingChatbot((p) => ({
                                ...p,
                                [q.id]: false,
                              }));
                              await refetch();
                            }}
                          >
                            챗봇 답변 적용
                          </button>
                        )}

                        <button
                          className={`${btn} bg-gray-500`}
                          onClick={() => {
                            // 어떤 수정 모드인지 확인
                            const cancelMessage = isEditingDisplay && isEditingChatbot
                              ? "답변 수정과 챗봇 답변 수정을 취소하시겠습니까?"
                              : isEditingDisplay
                              ? "답변 수정을 취소하시겠습니까?"
                              : "챗봇 답변 수정을 취소하시겠습니까?";

                            if (!confirm(cancelMessage)) return;

                            // 원본으로 롤백
                            setDisplayAnswers((p) => ({
                              ...p,
                              [q.id]: q.displayAnswer ?? "",
                            }));
                            setChatbotAnswers((p) => ({
                              ...p,
                              [q.id]: q.appliedAnswer ?? q.editingAnswer ?? "",
                            }));
                            setEditingDisplay((p) => ({
                              ...p,
                              [q.id]: false,
                            }));
                            setEditingChatbot((p) => ({
                              ...p,
                              [q.id]: false,
                            }));
                          }}
                        >
                          취소
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      

      {/* ===== 페이지네이션 ===== */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}
      </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
}