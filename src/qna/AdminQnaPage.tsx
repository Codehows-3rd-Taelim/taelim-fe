import { useEffect, useState } from "react";
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

const textareaClass = (editable: boolean) =>
  `w-full border rounded p-2 min-h-24 ${
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
  const [tab, setTab] = useState<Tab>("UNRESOLVED");
  const [resolvedView, setResolvedView] = useState<ResolvedView>("ALL");

  const [qnas, setQnas] = useState<Qna[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const [displayAnswers, setDisplayAnswers] = useState<Record<number, string>>(
    {}
  );
  const [chatbotAnswers, setChatbotAnswers] = useState<Record<number, string>>(
    {}
  );

  const [editingDisplay, setEditingDisplay] = useState<Record<number, boolean>>(
    {}
  );
  const [editingChatbot, setEditingChatbot] = useState<Record<number, boolean>>(
    {}
  );

  const [toast, setToast] = useState<string | null>(null);

  const toastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };


  useEffect(() => {
    const fetchQnaData = async () => {
      let data: Qna[] = [];

      if (tab === "ALL") data = await getQnaAll();
      else if (tab === "UNRESOLVED") data = await getQnaUnresolved();
      else if (tab === "RESOLVED") {
        if (resolvedView === "APPLIED") data = await getQnaApplied();
        else {
          data = await getQnaResolved();
          if (resolvedView === "NOT_APPLIED") {
            data = data.filter((q) => q.status !== "APPLIED");
          }
        }
      } else {
        data = await getQnaInactive();
      }

      setQnas(data);
      setOpenId(null);
    };

    fetchQnaData();
  }, [tab, resolvedView]);

  const fetchQna = async () => {
    let data: Qna[] = [];

    if (tab === "ALL") data = await getQnaAll();
    else if (tab === "UNRESOLVED") data = await getQnaUnresolved();
    else if (tab === "RESOLVED") {
      if (resolvedView === "APPLIED") data = await getQnaApplied();
      else {
        data = await getQnaResolved();
        if (resolvedView === "NOT_APPLIED") {
          data = data.filter((q) => q.status !== "APPLIED");
        }
      }
    } else {
      data = await getQnaInactive();
    }

    setQnas(data);
  };

  const toggle = (q: Qna) => {
    setOpenId((p) => (p === q.id ? null : q.id));
    setDisplayAnswers((p) => ({ ...p, [q.id]: q.displayAnswer ?? "" }));
    setChatbotAnswers((p) => ({
      ...p,
      [q.id]: q.appliedAnswer ?? q.editingAnswer ?? "",
    }));
    setEditingDisplay((p) => ({ ...p, [q.id]: false }));
    setEditingChatbot((p) => ({ ...p, [q.id]: false }));
  };

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
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k as Tab)}
            className={`px-3 py-1 rounded ${
              tab === k ? "bg-slate-700 text-white" : "bg-gray-200"
            }`}
          >
            {label}
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

      <div className="space-y-3">
        {qnas.map((q) => {
          const isInactive = Boolean(q.deletedAt);
          const isUnresolved = !q.resolved;

          const displayValue =
            displayAnswers[q.id] ?? q.displayAnswer ?? "";
          const chatbotValue =
            chatbotAnswers[q.id] ?? q.appliedAnswer ?? "";

          const isEditingDisplay = editingDisplay[q.id];
          const isEditingChatbot = editingChatbot[q.id];

          if (isInactive) {
            return (
              <div key={q.id} className="bg-white rounded shadow">
                <button
                  onClick={() => toggle(q)}
                  className="w-full px-4 py-3 flex gap-2 text-left"
                >
                  {statusBadge(q)}
                  <span className="truncate">{q.title}</span>
                </button>

                {openId === q.id && (
                  <div className="px-4 pb-4 border-t space-y-4">

                    {/* 질문 원문 */}
                    <div className="mt-3">
                      <div className="text-sm font-semibold mb-1">질문 내용</div>
                      <textarea
                        className={textareaClass(false)}
                        value={q.questionText}
                        readOnly
                      />
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-semibold mb-1">
                        표시될 답변
                      </div>
                      <textarea
                        className={textareaClass(false)}
                        value={displayValue}
                        readOnly
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={`${btn} bg-green-600`}
                        onClick={async () => {
                          await restoreQna(q.id);
                          toastMsg("질문이 복구되었습니다");
                          await fetchQna();
                        }}
                      >
                        질문 복구
                      </button>

                      <button
                        className={`${btn} bg-red-700`}
                        onClick={async () => {
                          if (!confirm("이 질문을 완전히 삭제합니다."))
                            return;
                          await deleteInactiveQna(q.id);
                          toastMsg("질문이 완전히 삭제되었습니다");
                          await fetchQna();
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

          // 활성 질문
          return (
            <div key={q.id} className="bg-white rounded shadow">
              <button
                onClick={() => toggle(q)}
                className="w-full px-4 py-3 flex gap-2 text-left"
              >
                {statusBadge(q)}
                <span className="truncate">{q.title}</span>
              </button>


              {openId === q.id && (
                <div className="px-4 pb-4 border-t space-y-4">
                    {/* 질문 원문 */}
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-1">질문 내용</div>
                    <textarea
                      className={textareaClass(false)}
                      value={q.questionText}
                      readOnly
                    />
                  </div>
                  {/* 표시 답변 */}
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-1">
                      표시될 답변
                    </div>
                    <textarea
                      className={textareaClass(
                        isUnresolved || isEditingDisplay
                      )}
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

                  {/* 챗봇 답변 */}
                  {!isUnresolved && (
                    <div>
                      <div className="text-sm font-semibold mb-1">
                        챗봇 적용 답변
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
                  <div className="flex gap-2 flex-wrap">
                    {/* 미처리 */}
                    {isUnresolved && (
                      <>
                        <button
                          className={`${btn} bg-green-600`}
                          onClick={async () => {
                            if (
                              !confirm(
                                "표시될 답변을 저장하시겠습니까?"
                              )
                            )
                              return;
                            await saveDisplayAnswer(q.id, displayValue);
                            toastMsg("표시 답변이 저장되었습니다");
                            await fetchQna();
                          }}
                        >
                          표시될 답변 저장
                        </button>

                        <button
                          className={`${btn} bg-red-600`}
                          onClick={async () => {
                            if (
                              !confirm(
                                "질문을 비활성 처리하시겠습니까?"
                              )
                            )
                              return;
                            await deleteQna(q.id);
                            toastMsg("질문이 비활성 처리되었습니다");
                            await fetchQna();
                          }}
                        >
                          질문 삭제
                        </button>
                      </>
                    )}

                    {/* 처리 */}
                    {!isUnresolved && !isEditingDisplay && !isEditingChatbot && (
                      <>
                        <button
                          className={`${btn} bg-slate-600`}
                          onClick={() =>
                            setEditingDisplay((p) => ({
                              ...p,
                              [q.id]: true,
                            }))
                          }
                        >
                          표시될 답변 수정
                        </button>

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
                          title={
                            q.appliedAnswer
                              ? ""
                              : "삭제할 챗봇 답변이 없습니다."
                          }
                          className={
                            q.appliedAnswer
                              ? `${btn} bg-orange-600`
                              : btnDisabled
                          }
                          onClick={async () => {
                            if (!q.appliedAnswer) return;
                            if (
                              !confirm("챗봇 답변을 삭제하시겠습니까?")
                            )
                              return;
                            await deleteAppliedAnswer(q.id);
                            setChatbotAnswers((p) => ({
                              ...p,
                              [q.id]: "",
                            }));
                            toastMsg("챗봇 답변이 삭제되었습니다");
                            await fetchQna();
                          }}
                        >
                          챗봇 답변 삭제
                        </button>

                        <button
                          disabled={!!q.appliedAnswer}
                          title={
                            q.appliedAnswer
                              ? "챗봇 답변 삭제 후 질문을 삭제할 수 있습니다"
                              : ""
                          }
                          className={
                            q.appliedAnswer
                              ? btnDisabled
                              : `${btn} bg-red-600`
                          }
                          onClick={async () => {
                            if (q.appliedAnswer) return;
                            if (
                              !confirm(
                                "질문을 비활성 처리하시겠습니까?"
                              )
                            )
                              return;
                            await deleteQna(q.id);
                            toastMsg("질문이 비활성 처리되었습니다");
                            await fetchQna();
                          }}
                        >
                          질문 삭제
                        </button>
                      </>
                    )}

                    {/* 수정 모드 */}
                    {(isEditingDisplay || isEditingChatbot) && (
                      <>
                        {isEditingDisplay && (
                          <button
                            className={`${btn} bg-green-600`}
                            onClick={async () => {
                              if (
                                !confirm(
                                  "표시될 답변을 저장하시겠습니까?"
                                )
                              )
                                return;
                              await updateDisplayAnswer(
                                q.id,
                                displayValue
                              );
                              toastMsg("표시 답변이 저장되었습니다");
                              setEditingDisplay((p) => ({
                                ...p,
                                [q.id]: false,
                              }));
                              await fetchQna();
                            }}
                          >
                            표시될 답변 저장
                          </button>
                        )}

                        {isEditingChatbot && (
                          <button
                            className={`${btn} bg-blue-600`}
                            onClick={async () => {
                              if (
                                !confirm(
                                  "챗봇 답변을 적용하시겠습니까?"
                                )
                              )
                                return;
                              await applyQna(q.id, chatbotValue);
                              toastMsg("챗봇 답변이 적용되었습니다");
                              setEditingChatbot((p) => ({
                                ...p,
                                [q.id]: false,
                              }));
                              await fetchQna();
                            }}
                          >
                            챗봇 답변 적용
                          </button>
                        )}

                        <button
                          className={`${btn} bg-gray-500`}
                          onClick={() => {
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

      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
}