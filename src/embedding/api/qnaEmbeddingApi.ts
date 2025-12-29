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

// qna 삭제 (Embed + Milvus 포함)
export const deleteQna = async (qnaId: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/qna/${qnaId}`,
    getAxiosConfig()
  );
};
