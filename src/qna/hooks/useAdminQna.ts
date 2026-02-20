import { useCallback, useEffect, useState } from "react";
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
import useToast from "./useToast";
import { PAGE_SIZE } from "../utils/qnaHelpers";
import { usePagination } from "../../hooks/usePagination";

export type ResolvedView = "ALL" | "APPLIED" | "NOT_APPLIED";

export default function useAdminQna() {
  const [viewType, setViewType] = useState<QnaViewType>("UNRESOLVED");
  const [resolvedView, setResolvedView] = useState<ResolvedView>("ALL");

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

  const { page, totalPages, setPage, setTotalPages, resetPage } = usePagination();
  const [loading, setLoading] = useState(true);

  const { toast, showToast } = useToast();

  // resolvedView에 대응하는 서버 status 파라미터
  const getStatusParam = useCallback(() => {
    if (viewType !== "RESOLVED" || resolvedView === "ALL") return undefined;
    return resolvedView as "APPLIED" | "NOT_APPLIED";
  }, [viewType, resolvedView]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const status = getStatusParam();
        const res: PaginationResponse<Qna> = await getQnaPage(
          viewType,
          page - 1, // API는 0-based
          PAGE_SIZE,
          status
        );
        setQnas(res.content);
        setTotalPages(res.totalPages);
        setOpenId(null);
      } catch (err) {
        console.error("QnA 목록 불러오기 실패", err);
        showToast("목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewType, resolvedView, page, getStatusParam, showToast]);

  const refetch = async () => {
    try {
      const status = getStatusParam();
      const res = await getQnaPage(viewType, page - 1, PAGE_SIZE, status); // API는 0-based
      setQnas(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("QnA 목록 불러오기 실패", err);
      showToast("목록을 불러오는데 실패했습니다.");
    }
  };

  const handleViewTypeChange = (v: QnaViewType) => {
    setViewType(v);
    resetPage();
  };

  const handleResolvedViewChange = (v: ResolvedView) => {
    setResolvedView(v);
    resetPage();
  };

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

  const getDisplayValue = (q: Qna) =>
    displayAnswers[q.id] ?? q.displayAnswer ?? "";

  const getChatbotValue = (q: Qna) =>
    chatbotAnswers[q.id] ??
    (q.status === "FAILED" ? q.editingAnswer ?? "" : q.appliedAnswer ?? "");

  // Action handlers
  const handleSaveDisplay = async (q: Qna) => {
    if (!confirm("답변을 저장하시겠습니까?")) return;
    try {
      await saveDisplayAnswer(q.id, getDisplayValue(q));
      showToast("답변 저장됨");
      await refetch();
    } catch {
      showToast("답변 저장에 실패했습니다.");
    }
  };

  const handleDeleteQna = async (q: Qna) => {
    if (!confirm("질문을 비활성 처리하시겠습니까?")) return;
    try {
      await deleteQna(q.id);
      showToast("질문 비활성 처리됨");
      await refetch();
    } catch {
      showToast("질문 삭제에 실패했습니다.");
    }
  };

  const handleEditDisplay = (qId: number) => {
    setEditingDisplay((p) => ({ ...p, [qId]: true }));
  };

  const handleEditChatbot = (qId: number) => {
    setEditingChatbot((p) => ({ ...p, [qId]: true }));
  };

  const handleRetryChatbot = async (q: Qna) => {
    const retryAnswer = getChatbotValue(q).trim();
    if (!retryAnswer) {
      alert("재적용할 챗봇 답변이 없습니다.");
      return;
    }
    if (!confirm("이 답변을 다시 챗봇에 적용하시겠습니까?")) return;
    try {
      await applyQna(q.id, retryAnswer);
      showToast("챗봇 답변 재적용 요청됨");
      await refetch();
    } catch {
      showToast("챗봇 답변 재적용 실패");
    }
  };

  const handleApplyChatbot = async (q: Qna) => {
    const val = getChatbotValue(q);
    if (!val || val.trim().length === 0) {
      alert("챗봇 답변을 입력해주세요. 공백은 불가능합니다.");
      return;
    }
    if (!confirm("챗봇 답변을 적용하시겠습니까?")) return;
    try {
      await applyQna(q.id, val.trim());
      showToast("챗봇 답변 적용됨");
      setEditingChatbot((p) => ({ ...p, [q.id]: false }));
      await refetch();
    } catch {
      showToast("챗봇 답변 적용에 실패했습니다.");
    }
  };

  const handleDeleteApplied = async (q: Qna) => {
    if (!confirm("챗봇 답변을 삭제하시겠습니까?")) return;
    try {
      await deleteAppliedAnswer(q.id);
      setChatbotAnswers((p) => {
        const next = { ...p };
        delete next[q.id];
        return next;
      });
      showToast("챗봇 답변 삭제됨");
      await refetch();
    } catch {
      showToast("챗봇 답변 삭제에 실패했습니다.");
    }
  };

  const handleSaveEditedDisplay = async (q: Qna) => {
    if (!confirm("답변을 저장하시겠습니까?")) return;
    try {
      await updateDisplayAnswer(q.id, getDisplayValue(q));
      showToast("답변 저장됨");
      setEditingDisplay((p) => ({ ...p, [q.id]: false }));
      await refetch();
    } catch {
      showToast("답변 저장에 실패했습니다.");
    }
  };

  const handleCancel = (q: Qna) => {
    const isED = editingDisplay[q.id];
    const isEC = editingChatbot[q.id];
    const cancelMessage =
      isED && isEC
        ? "답변 수정과 챗봇 답변 수정을 취소하시겠습니까?"
        : isED
        ? "답변 수정을 취소하시겠습니까?"
        : "챗봇 답변 수정을 취소하시겠습니까?";

    if (!confirm(cancelMessage)) return;

    setDisplayAnswers((p) => ({ ...p, [q.id]: q.displayAnswer ?? "" }));
    setChatbotAnswers((p) => ({
      ...p,
      [q.id]: q.appliedAnswer ?? q.editingAnswer ?? "",
    }));
    setEditingDisplay((p) => ({ ...p, [q.id]: false }));
    setEditingChatbot((p) => ({ ...p, [q.id]: false }));
  };

  const handleRestore = async (q: Qna) => {
    try {
      await restoreQna(q.id);
      showToast("질문이 복구되었습니다");
      await refetch();
    } catch {
      showToast("질문 복구에 실패했습니다.");
    }
  };

  const handleHardDelete = async (q: Qna) => {
    if (!confirm("이 질문을 완전히 삭제합니다.")) return;
    try {
      await deleteInactiveQna(q.id);
      showToast("질문이 완전히 삭제되었습니다");
      await refetch();
    } catch {
      showToast("질문 삭제에 실패했습니다.");
    }
  };

  return {
    viewType,
    resolvedView,
    qnas,
    openId,
    page,
    totalPages,
    loading,
    toast,
    displayAnswers,
    chatbotAnswers,
    editingDisplay,
    editingChatbot,
    handleViewTypeChange,
    handleResolvedViewChange,
    setPage,
    toggle,
    getDisplayValue,
    getChatbotValue,
    setDisplayAnswers,
    setChatbotAnswers,
    handleSaveDisplay,
    handleDeleteQna,
    handleEditDisplay,
    handleEditChatbot,
    handleRetryChatbot,
    handleApplyChatbot,
    handleDeleteApplied,
    handleSaveEditedDisplay,
    handleCancel,
    handleRestore,
    handleHardDelete,
  };
}
