import { useEffect, useState } from "react";
import {
  getQuestionsAll,
  getQuestionsResolved,
  getQuestionsUnresolved,
  getAnswer,
  createAnswer,
  updateAnswer,
} from "../api/qnaEmbeddingApi";
import type { Question, Answer } from "../../type";

type Filter = "ALL" | "UNRESOLVED" | "RESOLVED";

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>("UNRESOLVED");
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  

  const fetchQuestions = async () => {
    setLoading(true);

    const data =
      filter === "ALL"
        ? await getQuestionsAll()
        : filter === "RESOLVED"
        ? await getQuestionsResolved()
        : await getQuestionsUnresolved();

    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    setOpenQuestionId(null);
  }, [filter]);



  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);


  const toggleQuestion = async (q: Question) => {
    if (openQuestionId === q.questionId) {
      setOpenQuestionId(null);
      return;
    }

    setOpenQuestionId(q.questionId);

    if (q.resolved && !answers[q.questionId]) {
      const answer: Answer = await getAnswer(q.questionId);
      setAnswers((prev) => ({
        ...prev,
        [q.questionId]: answer.answerText,
      }));
    }
  };

  if (loading) {
    return <div className="p-6">로딩중...</div>;
  }



  return (
    <div className="bg-white rounded-2xl shadow p-6 relative">
      <h2 className="font-bold text-lg mb-4">질문 관리</h2>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "ALL", label: "전체" },
          { key: "UNRESOLVED", label: "미응답" },
          { key: "RESOLVED", label: "답변완료" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as Filter)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f.key
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 질문 리스트 */}
      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        {questions.map((q) => (
          <div key={q.questionId} className="bg-white rounded-lg">
            <button
              type="button"
              onClick={() => toggleQuestion(q)}
              className="w-full px-4 py-3 flex justify-between items-center text-left"
            >
              <span>{q.userQuestionText}</span>
            </button>

            {openQuestionId === q.questionId && (
              <div className="px-4 pb-4">
                <textarea
                  placeholder={
                    q.resolved ? "답변을 수정하세요" : "답변을 입력하세요"
                  }
                  value={answers[q.questionId] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.questionId]: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 mb-2 min-h-[80px]"
                />

                <button
                  disabled={submitting || !answers[q.questionId]}
                  onClick={async () => {
                    try {
                      setSubmitting(true);

                      if (q.resolved) {
                        await updateAnswer(
                          q.questionId,
                          answers[q.questionId]
                        );
                      } else {
                        await createAnswer(
                          q.questionId,
                          answers[q.questionId]
                        );
                      }

                      await fetchQuestions();

                      setToast(
                        q.resolved
                          ? "답변이 수정되었습니다."
                          : "답변이 등록되었습니다."
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="bg-orange-500 text-white px-4 py-1 rounded disabled:opacity-50"
                >
                  {submitting
                    ? "저장중..."
                    : q.resolved
                    ? "수정"
                    : "등록"}
                </button>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            표시할 질문이 없습니다
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed top-[22%] left-[58%] -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
