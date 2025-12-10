// src/api/aiReport.api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

//리포트 전체 가져오기 rawReport제외
export const getAiReport = async () => {
  const response = await axios.get(`${BASE_URL}/ai/Report`);
  return response.data;
};

//rawReport 가져오기
export const getRawReport = async (reportId: number) => {
  const response = await axios.get(
    `${BASE_URL}/ai/Report/${reportId}/rawReport`
  );
  return response.data;
};

// AI 리포트 생성 요청 (POST)
export const postAiReport = async (message: string, conversationId: string) => {
  return axios.post(`${BASE_URL}/ai/Report`, {
    message,
    conversationId,
  });
};
