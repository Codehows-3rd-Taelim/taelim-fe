import type { Qna } from "../../type";
import StatusBadge from "./StatusBadge";
import { textareaClass, btn, btnDisabled } from "../utils/qnaHelpers";

interface Props {
  q: Qna;
  isOpen: boolean;
  onToggle: () => void;
  displayValue: string;
  chatbotValue: string;
  isEditingDisplay: boolean;
  isEditingChatbot: boolean;
  onDisplayChange: (value: string) => void;
  onChatbotChange: (value: string) => void;
  onSaveDisplay: () => void;
  onDeleteQna: () => void;
  onEditDisplay: () => void;
  onEditChatbot: () => void;
  onRetryChatbot: () => void;
  onApplyChatbot: () => void;
  onDeleteApplied: () => void;
  onSaveEditedDisplay: () => void;
  onCancel: () => void;
}

export default function AdminQnaCard({
  q,
  isOpen,
  onToggle,
  displayValue,
  chatbotValue,
  isEditingDisplay,
  isEditingChatbot,
  onDisplayChange,
  onChatbotChange,
  onSaveDisplay,
  onDeleteQna,
  onEditDisplay,
  onEditChatbot,
  onRetryChatbot,
  onApplyChatbot,
  onDeleteApplied,
  onSaveEditedDisplay,
  onCancel,
}: Props) {
  const isUnresolved = !q.resolved;

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
              onChange={(e) => onDisplayChange(e.target.value)}
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
                onChange={(e) => onChatbotChange(e.target.value)}
              />
            </div>
          )}

          {/* ===== 버튼 ===== */}
          <div className="flex gap-2 flex-wrap max-w-full">
            {isUnresolved && (
              <>
                <button
                  className={`${btn} bg-green-600`}
                  onClick={onSaveDisplay}
                >
                  답변 저장
                </button>
                <button
                  className={`${btn} bg-red-600`}
                  onClick={onDeleteQna}
                >
                  질문 삭제
                </button>
              </>
            )}

            {!isUnresolved && !isEditingDisplay && !isEditingChatbot && (
              <>
                <button
                  className={`${btn} bg-green-600`}
                  onClick={onEditDisplay}
                >
                  답변 수정
                </button>

                {q.status === "FAILED" && (
                  <button
                    className={`${btn} bg-yellow-400 hover:bg-yellow-500 text-black`}
                    onClick={onRetryChatbot}
                  >
                    챗봇 답변 재적용
                  </button>
                )}

                <button
                  className={`${btn} bg-indigo-600`}
                  onClick={onEditChatbot}
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
                  onClick={onDeleteApplied}
                >
                  챗봇 답변 삭제
                </button>

                <button
                  disabled={!!q.appliedAnswer}
                  className={
                    q.appliedAnswer ? btnDisabled : `${btn} bg-red-600`
                  }
                  onClick={onDeleteQna}
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
                    onClick={onSaveEditedDisplay}
                  >
                    답변 저장
                  </button>
                )}

                {isEditingChatbot && (
                  <button
                    className={`${btn} bg-blue-600`}
                    onClick={onApplyChatbot}
                  >
                    챗봇 답변 적용
                  </button>
                )}

                <button
                  className={`${btn} bg-gray-500`}
                  onClick={onCancel}
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
}
