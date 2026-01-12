import axios, { type AxiosRequestConfig } from "axios";
import type { Qna, QnaRequest } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

const getAxiosConfig = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt");
  return {
    headers: {
      Authorization: token,
    },
  };
};


// qna 전체 조회
export const getQnaAll = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna`, getAxiosConfig());
  return res.data;
};

// qna 미처리만 조회
export const getQnaUnresolved = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/unresolved`, getAxiosConfig());
  return res.data;
};

// qna 처리된것만 조회
export const getQnaResolved = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/resolved`, getAxiosConfig());
  return res.data;
};

// 임베딩 적용된것만 조회
export const getQnaApplied = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/applied`, getAxiosConfig());
  return res.data;
};


// 임베딩 적용
  export const applyQna = async ( qnaId: number, answer: string): Promise<void> => {
  await axios.post(
    `${BASE_URL}/qna/embed/${qnaId}/apply`,{ answer },getAxiosConfig()
  );
};

// qna 삭제 
export const deleteQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}`,
    getAxiosConfig()
  );
};



//  비활성 질문 목록
export const getQnaInactive = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/inactive`, getAxiosConfig());
  return res.data;
};

// 표시 답변 저장
export const saveDisplayAnswer = async (qnaId: number,answer: string): Promise<void> => {
  await axios.post(`${BASE_URL}/qna/${qnaId}/display-answer`,{ answer }, getAxiosConfig());
};

// 표시 답변 수정
export const updateDisplayAnswer = async (qnaId: number, answer: string): Promise<void> => {
  await axios.put(`${BASE_URL}/qna/${qnaId}/display-answer`, { answer }, getAxiosConfig());
};

// 표시 답변 삭제
export const deleteDisplayAnswer = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}/display-answer`,
    getAxiosConfig()
  );
};

export const deleteAppliedAnswer = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/embed/${qnaId}/apply`,
    getAxiosConfig()
  );
};

//  비활성 질문 완전 삭제
export const deleteInactiveQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}/hard-delete`,
    getAxiosConfig()
  );
};

//  복구
export const restoreQna = async (qnaId: number): Promise<void> => {
  await axios.post(
    `${BASE_URL}/qna/${qnaId}/restore`,
    {},
    getAxiosConfig()
  );
};

// 질문 생성
export const createQna = async (data: QnaRequest): Promise<void> => {
  await axios.post(`${BASE_URL}/qna`, data, getAxiosConfig());
};

// 질문 수정
export const updateUserQuestion = async (
  qnaId: number,
  data: QnaRequest
): Promise<void> => {
  await axios.put(
    `${BASE_URL}/qna/${qnaId}/question`,
    data,
    getAxiosConfig()
  );
};



// 유저 질문 삭제 (displayAnswer == null 일 때만 가능)
export const deleteUserQuestion = async (qnaId: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/qna/${qnaId}/question`,getAxiosConfig());
};

