import type { Qna } from "../../type";
import StatusBadge from "./StatusBadge";
import { textareaClass, btn } from "../utils/qnaHelpers";

interface Props {
  q: Qna;
  isOpen: boolean;
  onToggle: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export default function AdminInactiveCard({
  q,
  isOpen,
  onToggle,
  onRestore,
  onHardDelete,
}: Props) {
  const displayValue = q.displayAnswer ?? "";

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex gap-2 text-left focus:outline-none focus:ring-0"
      >
        <StatusBadge q={q} />
        <span className="truncate">{q.title}</span>
      </button>

      {isOpen && (
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
              onClick={onRestore}
            >
              질문 복구
            </button>
            <button
              className={`${btn} bg-red-700`}
              onClick={onHardDelete}
            >
              질문 완전 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
