import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// 모든 요청에 JWT 토큰 자동 추가하는 인터셉터 설정
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 자동 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
