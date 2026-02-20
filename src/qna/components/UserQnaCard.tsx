import type { Qna } from "../../type";
import UserStatusBadge from "./UserStatusBadge";
import {
  formatDate,
  inputBase,
  textareaBase,
  readOnlyStyle,
  editableStyle,
} from "../utils/qnaHelpers";

interface Props {
  q: Qna;
  isOpen: boolean;
  isEditing: boolean;
  title: string;
  questionText: string;
  submitting: boolean;
  onToggle: () => void;
  onTitleChange: (value: string) => void;
  onQuestionTextChange: (value: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function UserQnaCard({
  q,
  isOpen,
  isEditing,
  title,
  questionText,
  submitting,
  onToggle,
  onTitleChange,
  onQuestionTextChange,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: Props) {
  const canEdit = q.displayAnswer == null;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-0"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <UserStatusBadge q={q} />
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(q.createdAt)}
          </span>
        </div>

        <div className="text-sm font-semibold mb-1">제목</div>
        <input
          value={title}
          readOnly={!isEditing}
          onChange={(e) => onTitleChange(e.target.value)}
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
              value={questionText}
              readOnly={!isEditing}
              onChange={(e) => onQuestionTextChange(e.target.value)}
              className={`${textareaBase} ${
                isEditing ? editableStyle : readOnlyStyle
              }`}
            />
          </div>

          {q.displayAnswer && (
            <div>
              <div className="text-sm font-semibold mb-1">답변</div>
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
                    onClick={onEdit}
                    className="px-4 py-1.5 rounded-md bg-slate-600 text-white"
                  >
                    수정
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-4 py-1.5 rounded-md bg-red-500 text-white"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={submitting}
                    onClick={onSave}
                    className="px-4 py-1.5 rounded-md bg-[#4A607A] text-white"
                  >
                    저장
                  </button>
                  <button
                    onClick={onCancel}
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
}
