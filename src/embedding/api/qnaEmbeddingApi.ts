import axios, { type AxiosRequestConfig } from "axios";
import type { Question, Answer } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

const getAxiosConfig = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt");
  return {
    headers: {
      Authorization: token,
    },
  };
};


export const getQuestionsAll = async (): Promise<Question[]> => {
  const res = await axios.get(`${BASE_URL}/questions`, getAxiosConfig());
  return res.data;
};

export const getQuestionsUnresolved = async (): Promise<Question[]> => {
  const res = await axios.get(
    `${BASE_URL}/questions/unresolved`,
    getAxiosConfig()
  );
  return res.data;
};

export const getQuestionsResolved = async (): Promise<Question[]> => {
  const res = await axios.get(
    `${BASE_URL}/questions/resolved`,
    getAxiosConfig()
  );
  return res.data;
};

// 답변 조회
export const getAnswer = async (questionId: number): Promise<Answer> => {
  const res = await axios.get(
    `${BASE_URL}/questions/${questionId}/answer`,
    getAxiosConfig()
  );
  return res.data;
};


export const updateAnswer = async (
  questionId: number,
  answerText: string
): Promise<void> => {
  await axios.put(
    `${BASE_URL}/questions/${questionId}/answer`,
    { questionId, answerText },
    getAxiosConfig()
  );
};


export const createAnswer = async (
  questionId: number,
  answerText: string
): Promise<void> => {
  await axios.post(
    `${BASE_URL}/questions/${questionId}/answer`,
    { questionId, answerText },
    getAxiosConfig()
  );
};

