import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// 로컬 스토리지 등에서 JWT 토큰을 가져오는 함수 (토큰을 저장하는 방식에 따라 수정 필요)
const getAuthToken = () => {
  // 예시: 'token' 이라는 키로 저장되어 있다고 가정
  return localStorage.getItem("token");
};

export const getAiReport = async () => {
  const token = getAuthToken();

  // 🚨 토큰이 없거나, 토큰이 있지만 'Bearer ' 접두사가 없는 경우를 대비하여 헤더에 토큰을 포함시킵니다.
  // 백엔드의 JwtService.parseToken()을 보면 'Bearer ' 접두사를 기대합니다.
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${BASE_URL}/aiReport`, { headers });
  return response.data; // response.data.data가 아니라 response.data를 반환하도록 수정 (API 응답 구조에 따라 다를 수 있으나, 컨트롤러는 List<AiReportDTO>를 반환합니다.)
};
