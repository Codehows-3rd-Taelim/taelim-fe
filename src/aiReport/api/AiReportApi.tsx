import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// AI 리포트 가져오기
export const getAiReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/aiReport`);
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    console.error("getAiReport 호출 에러:", error);
    throw error;
  }
};
