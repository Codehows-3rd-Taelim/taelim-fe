import { useEffect, useState } from "react";
import {
  inputBase,
  textareaBase,
  editableStyle,
} from "../utils/qnaHelpers";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, questionText: string) => Promise<void>;
  initialQuestion?: string;
  variant?: "full" | "compact";
}

export default function QnaCreateModal({
  open,
  onClose,
  onSubmit,
  initialQuestion = "",
  variant = "full",
}: Props) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState(initialQuestion);

  // initialQuestion이 변경될 때 (AIChat에서 다른 메시지로 모달을 열 때) 동기화
  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  if (!open) return null;

  const handleClose = () => {
    if (variant === "full") {
      if (!confirm("질문 등록을 취소하시겠습니까?")) return;
    }
    setTitle("");
    setQuestion("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요");
      return;
    }
    if (variant === "full" && !question.trim()) {
      alert("제목과 내용을 입력하세요");
      return;
    }

    if (
      variant === "full" &&
      !confirm(
        "질문을 등록하시겠습니까?\n질문에 답변이 달린 이후에는 수정 및 삭제가 불가능합니다."
      )
    )
      return;

    await onSubmit(title.trim(), question.trim());
    setTitle("");
    setQuestion("");
  };

  if (variant === "compact") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold">QnA 등록</h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-[120px]"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 rounded bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded bg-slate-700 text-white"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl min-h-[520px] rounded-2xl px-10 py-8 shadow-xl flex flex-col">
        <h3 className="text-xl font-bold mb-4">질문 등록</h3>

        <input
          placeholder="제목을 입력하세요 (50자 이내)"
          value={title}
          maxLength={50}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputBase} ${editableStyle} mb-4`}
        />

        <textarea
          placeholder="내용을 입력하세요"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={`${textareaBase} ${editableStyle} flex-1 min-h-[220px]`}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-md bg-gray-200"
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-md bg-slate-700 text-white"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
