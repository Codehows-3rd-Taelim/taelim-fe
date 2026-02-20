import { useEffect, useState } from "react";
import type { Qna, PaginationResponse, QnaViewType } from "../../type";
import {
  getQnaPage,
  updateUserQuestion,
  deleteUserQuestion,
  createQna,
} from "../api/qnaApi";
import useToast from "./useToast";
import { PAGE_SIZE, isBlank } from "../utils/qnaHelpers";
import { usePagination } from "../../hooks/usePagination";

export default function useUserQna() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewType, setViewType] = useState<QnaViewType>("ALL");

  const { page, totalPages, setPage, setTotalPages, resetPage } = usePagination();

  const [reloadKey, setReloadKey] = useState(0);

  const [openId, setOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [originTitles, setOriginTitles] = useState<Record<number, string>>({});
  const [originQuestionTexts, setOriginQuestionTexts] =
    useState<Record<number, string>>({});

  const [titles, setTitles] = useState<Record<number, string>>({});
  const [questionTexts, setQuestionTexts] =
    useState<Record<number, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { toast, showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res: PaginationResponse<Qna> = await getQnaPage(
          viewType,
          page - 1, // API는 0-based
          PAGE_SIZE
        );

        if (cancelled) return;

        setQnas(res.content);
        setTotalPages(res.totalPages);
        setOpenId(null);
        setEditingId(null);

        const t = Object.fromEntries(
          res.content.map((q) => [q.id, q.title])
        );
        const a = Object.fromEntries(
          res.content.map((q) => [q.id, q.questionText])
        );

        setOriginTitles(t);
        setOriginQuestionTexts(a);
        setTitles(t);
        setQuestionTexts(a);
      } catch (err) {
        console.error("QnA 목록 불러오기 실패", err);
        if (!cancelled) showToast("목록을 불러오는데 실패했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [viewType, page, reloadKey, showToast]);

  const handleViewTypeChange = (v: QnaViewType) => {
    setViewType(v);
    resetPage();
  };

  const toggle = (q: Qna) => {
    if (editingId === q.id) return;

    setOpenId((prev) => {
      const next = prev === q.id ? null : q.id;

      if (next !== null) {
        setTitles((p) => ({ ...p, [q.id]: originTitles[q.id] ?? q.title }));
        setQuestionTexts((p) => ({
          ...p,
          [q.id]: originQuestionTexts[q.id] ?? q.questionText,
        }));
        setEditingId(null);
      }

      return next;
    });
  };

  const handleEdit = (qId: number) => {
    setEditingId(qId);
  };

  const handleDelete = async (q: Qna) => {
    if (!confirm("질문을 삭제하시겠습니까?")) return;
    try {
      await deleteUserQuestion(q.id);
      showToast("질문이 삭제되었습니다.");
      resetPage();
      setReloadKey((k) => k + 1);
    } catch {
      showToast("질문 삭제에 실패했습니다.");
    }
  };

  const handleSave = async (q: Qna) => {
    if (isBlank(titles[q.id]) || isBlank(questionTexts[q.id])) {
      alert("공백만 입력할 수 없습니다.");
      return;
    }
    if (!confirm("질문을 수정하시겠습니까?")) return;

    setSubmitting(true);
    try {
      await updateUserQuestion(q.id, {
        title: titles[q.id],
        questionText: questionTexts[q.id],
      });

      setOriginTitles((p) => ({ ...p, [q.id]: titles[q.id] }));
      setOriginQuestionTexts((p) => ({
        ...p,
        [q.id]: questionTexts[q.id],
      }));

      setEditingId(null);
      showToast("질문이 수정되었습니다.");
    } catch {
      showToast("질문 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (q: Qna) => {
    if (!confirm("수정을 취소하시겠습니까?")) return;
    setTitles((p) => ({ ...p, [q.id]: originTitles[q.id] }));
    setQuestionTexts((p) => ({
      ...p,
      [q.id]: originQuestionTexts[q.id],
    }));
    setEditingId(null);
  };

  const handleCreate = async (title: string, questionText: string) => {
    try {
      await createQna({ title, questionText });
      showToast("질문이 등록되었습니다.");
      setCreateOpen(false);
      resetPage();
      setReloadKey((k) => k + 1);
    } catch {
      showToast("질문 등록에 실패했습니다.");
    }
  };

  return {
    qnas,
    loading,
    viewType,
    page,
    totalPages,
    openId,
    editingId,
    titles,
    questionTexts,
    toast,
    submitting,
    createOpen,
    setPage,
    setCreateOpen,
    handleViewTypeChange,
    toggle,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleCreate,
    setTitles,
    setQuestionTexts,
  };
}
