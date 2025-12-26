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

/* =========================
 * 조회
 * ========================= */

export const getQnaAll = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna`, getAxiosConfig());
  return res.data;
};

export const getQnaUnresolved = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/unresolved`, getAxiosConfig());
  return res.data;
};

export const getQnaResolved = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/resolved`, getAxiosConfig());
  return res.data;
};

export const getQnaApplied = async (): Promise<Qna[]> => {
  const res = await axios.get(`${BASE_URL}/qna/applied`, getAxiosConfig());
  return res.data;
};

export const getQnaResolvedWithoutQna = async (): Promise<Qna[]> => {
  const res = await axios.get(
    `${BASE_URL}/qna/resolved/without-qna`,
    getAxiosConfig()
  );
  return res.data;
};

/* =========================
 * 관리자 액션
 * ========================= */

// 답변 초안 저장 (editingAnswer)
export const updateEditingAnswer = async (
  qnaId: number,
  answer: string
): Promise<void> => {
  await axios.put(
    `${BASE_URL}/qna/${qnaId}/answer`,
    { answer },
    getAxiosConfig()
  );
};


  
  export const applyQna = async ( qnaId: number, answer: string): Promise<void> => {
  await axios.post(
    `${BASE_URL}/qna/${qnaId}/apply`,{ answer },getAxiosConfig()
  );
};


// 파일/정책 처리로 QnA 미사용 종료
export const resolveWithoutQna = async (qnaId: number): Promise<void> => {
  await axios.post(
    `${BASE_URL}/qna/${qnaId}/resolve-without-qna`,
    {},
    getAxiosConfig()
  );
};

// 완전 삭제 (Embed + Milvus 포함)
export const deleteQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}`,
    getAxiosConfig()
  );
};
