import axios, { type AxiosRequestConfig } from "axios";
import type { Qna } from "../../type";

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
    `${BASE_URL}/qna/${qnaId}/apply`,{ answer },getAxiosConfig()
  );
};

// qna 삭제 
export const deleteQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}`,
    getAxiosConfig()
  );
};



//  비활성 질문 목록 (추가)
export const getQnaInactive = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/inactive`, getAxiosConfig());
  return res.data;
};

export const saveDisplayAnswer = async (qnaId: number,answer: string): Promise<void> => {
  await axios.post(`${BASE_URL}/qna/${qnaId}/display-answer`,{ answer }, getAxiosConfig());
};

export const updateDisplayAnswer = async (qnaId: number, answer: string): Promise<void> => {
  await axios.put(`${BASE_URL}/qna/${qnaId}/display-answer`, { answer }, getAxiosConfig());
};

export const deleteDisplayAnswer = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}/display-answer`,
    getAxiosConfig()
  );
};

export const deleteAppliedAnswer = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}/applied-answer`,
    getAxiosConfig()
  );
};

//  비활성 질문 완전 삭제
export const deleteInactiveQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}/hard`,
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
export const createQna = async (questionText: string): Promise<number> => {
  const res = await axios.post(
    `${BASE_URL}/qna`,
    { questionText },
    getAxiosConfig()
  );
  return res.data;
};

