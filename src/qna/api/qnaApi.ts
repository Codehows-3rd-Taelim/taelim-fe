import axios from "axios";
import type { PaginationResponse, Qna, QnaRequest, QnaViewType } from "../../type";
import { endpoints } from "../../api/endpoints";

export const getQnaPage = async (
  viewType: QnaViewType,
  page: number,
  size: number,
  status?: "APPLIED" | "NOT_APPLIED"
): Promise<PaginationResponse<Qna>> => {
  const params = new URLSearchParams({
    viewType,
    page: String(page),
    size: String(size),
  });
  if (status) params.append("status", status);
  const res = await axios.get<PaginationResponse<Qna>>(`${endpoints.qna.base}?${params}`);
  return res.data;
};

// 임베딩 적용
export const applyQna = async (qnaId: number, answer: string): Promise<void> => {
  await axios.post(endpoints.qna.embedding(qnaId), { answer });
};

// qna 삭제
export const deleteQna = async (qnaId: number): Promise<void> => {
  await axios.delete(endpoints.qna.byId(qnaId));
};

// 표시 답변 저장
export const saveDisplayAnswer = async (qnaId: number, answer: string): Promise<void> => {
  await axios.post(endpoints.qna.answer(qnaId), { answer });
};

// 표시 답변 수정
export const updateDisplayAnswer = async (qnaId: number, answer: string): Promise<void> => {
  await axios.put(endpoints.qna.answer(qnaId), { answer });
};

// 챗봇 적용 답변 삭제
export const deleteAppliedAnswer = async (qnaId: number): Promise<void> => {
  await axios.delete(endpoints.qna.embedding(qnaId));
};

// 비활성 질문 완전 삭제
export const deleteInactiveQna = async (qnaId: number): Promise<void> => {
  await axios.delete(`${endpoints.qna.byId(qnaId)}?force=true`);
};

// 복구
export const restoreQna = async (qnaId: number): Promise<void> => {
  await axios.post(endpoints.qna.restore(qnaId), {});
};

// 질문 생성
export const createQna = async (data: QnaRequest): Promise<void> => {
  await axios.post(endpoints.qna.base, data);
};

// 질문 수정
export const updateUserQuestion = async (
  qnaId: number,
  data: QnaRequest
): Promise<void> => {
  await axios.put(endpoints.qna.question(qnaId), data);
};

// 유저 질문 삭제 (displayAnswer == null 일 때만 가능)
export const deleteUserQuestion = async (qnaId: number): Promise<void> => {
  await axios.delete(endpoints.qna.question(qnaId));
};
