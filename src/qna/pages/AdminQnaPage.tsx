import Pagination from "../../components/Pagination";
import useAdminQna from "../hooks/useAdminQna";
import AdminQnaTabBar from "../components/AdminQnaTabBar";
import AdminInactiveCard from "../components/AdminInactiveCard";
import AdminQnaCard from "../components/AdminQnaCard";
import QnaToast from "../components/QnaToast";

export default function AdminQnaPage() {
  const {
    viewType,
    resolvedView,
    qnas,
    openId,
    page,
    totalPages,
    loading,
    toast,
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
  } = useAdminQna();

  if (loading) return <div className="p-6">로딩중...</div>;

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-md pb-4">
        <div className="bg-gray-100 px-6 py-4 rounded-md">
          <h2 className="text-lg font-bold mb-4">QnA</h2>

          <AdminQnaTabBar
            viewType={viewType}
            resolvedView={resolvedView}
            onViewTypeChange={handleViewTypeChange}
            onResolvedViewChange={handleResolvedViewChange}
          />

          <div className="space-y-3">
            {qnas.map((q) =>
              q.deletedAt ? (
                <AdminInactiveCard
                  key={q.id}
                  q={q}
                  isOpen={openId === q.id}
                  onToggle={() => toggle(q)}
                  onRestore={() => handleRestore(q)}
                  onHardDelete={() => handleHardDelete(q)}
                />
              ) : (
                <AdminQnaCard
                  key={q.id}
                  q={q}
                  isOpen={openId === q.id}
                  onToggle={() => toggle(q)}
                  displayValue={getDisplayValue(q)}
                  chatbotValue={getChatbotValue(q)}
                  isEditingDisplay={!!editingDisplay[q.id]}
                  isEditingChatbot={!!editingChatbot[q.id]}
                  onDisplayChange={(v) =>
                    setDisplayAnswers((p) => ({ ...p, [q.id]: v }))
                  }
                  onChatbotChange={(v) =>
                    setChatbotAnswers((p) => ({ ...p, [q.id]: v }))
                  }
                  onSaveDisplay={() => handleSaveDisplay(q)}
                  onDeleteQna={() => handleDeleteQna(q)}
                  onEditDisplay={() => handleEditDisplay(q.id)}
                  onEditChatbot={() => handleEditChatbot(q.id)}
                  onRetryChatbot={() => handleRetryChatbot(q)}
                  onApplyChatbot={() => handleApplyChatbot(q)}
                  onDeleteApplied={() => handleDeleteApplied(q)}
                  onSaveEditedDisplay={() => handleSaveEditedDisplay(q)}
                  onCancel={() => handleCancel(q)}
                />
              )
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <QnaToast message={toast} position="bottom-right" />
    </div>
  );
}
