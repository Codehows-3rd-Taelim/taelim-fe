import Pagination from "../../components/Pagination";
import type { QnaViewType } from "../../type";
import useUserQna from "../hooks/useUserQna";
import UserQnaCard from "../components/UserQnaCard";
import QnaToast from "../components/QnaToast";
import QnaCreateModal from "../components/QnaCreateModal";

export default function UserQnaPage() {
  const {
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
  } = useUserQna();

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <>
      <div className="w-full h-full flex justify-center bg-gray-100 pb-6">
        <div className="w-full max-w-[1400px] px-6 pt-4">
          <h2 className="font-bold text-lg my-5">Q&A</h2>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(
                [
                  ["ALL", "전체"],
                  ["UNRESOLVED", "처리중"],
                  ["RESOLVED", "처리완료"],
                ] as [QnaViewType, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => handleViewTypeChange(k)}
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
              {qnas.map((q) => (
                <UserQnaCard
                  key={q.id}
                  q={q}
                  isOpen={openId === q.id}
                  isEditing={editingId === q.id}
                  title={titles[q.id] ?? ""}
                  questionText={questionTexts[q.id] ?? ""}
                  submitting={submitting}
                  onToggle={() => toggle(q)}
                  onTitleChange={(v) =>
                    setTitles((p) => ({ ...p, [q.id]: v }))
                  }
                  onQuestionTextChange={(v) =>
                    setQuestionTexts((p) => ({ ...p, [q.id]: v }))
                  }
                  onEdit={() => handleEdit(q.id)}
                  onDelete={() => handleDelete(q)}
                  onSave={() => handleSave(q)}
                  onCancel={() => handleCancel(q)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 mb-24">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          <QnaToast message={toast} position="top-center" />
        </div>
      </div>

      <QnaCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        variant="full"
      />
    </>
  );
}
