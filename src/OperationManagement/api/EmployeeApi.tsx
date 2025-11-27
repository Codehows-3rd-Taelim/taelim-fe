import axios from "axios";
import type { ApiFormUser, Store } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

// 1. Axios 인스턴스 생성 또는 기본 설정 수정
// 토큰을 localStorage에서 가져와 모든 요청 헤더에 추가하는 인터셉터 설정
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwtToken"); // 💡 로컬 스토리지에서 토큰을 가져옵니다.

        if (token) {
            // 모든 요청 헤더에 Authorization 필드를 추가합니다.
            // 서버 설정에 따라 'Bearer ' 접두사를 사용하거나 생략할 수 있습니다.
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * ID 중복 확인 API 호출
 * @param id 확인할 로그인 ID (DTO 필드명은 'id'이지만, API 경로상 loginId로 받는다고 가정하고 전달)
 * @returns {Promise<{exists: boolean}>} 중복 여부 객체
 */
// **주의:** 백엔드에서 '/signup/check_loginid'를 통해 DTO의 'id' 필드를 받는지 확인 필요
export const checkDuplicateId = async (id: string): Promise<{ exists: boolean }> => {
  if (!id.trim()) {
    throw new Error("ID를 입력해주세요.");
  }

  try {
    // DTO 필드가 'id'이지만, 엔드포인트 URL이 'check_loginid'이므로 params 키를 'id'로 설정합니다.
    const response = await axios.get(`${BASE_URL}/signup/check_loginid`, {
      params: { id: id.trim() },
    });
    return response.data;
  } catch (error) {
    console.error("ID 중복 확인 API 오류:", error);
    // AxiosError에서 응답 본문이 있으면 사용
    const errorMessage = axios.isAxiosError(error) && error.response ? error.response.data || "아이디 중복 확인 중 서버 오류가 발생했습니다." : "아이디 중복 확인 중 서버 오류가 발생했습니다.";
    throw new Error(errorMessage);
  }
};


/**
 * 직원 등록 API 호출
 * @param userData 등록할 직원 데이터 (ApiFormUser 형식)
 * @returns {Promise<string>} 성공 시 메시지
 */
export const registerEmployee = async (userData: ApiFormUser): Promise<string> => {
    try {
        // ApiFormUser를 그대로 전송 (필드명 'id'와 'pw' 사용)
        const response = await axios.post(`${BASE_URL}/signup`, userData);
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data || "알 수 없는 등록 오류";
            throw new Error(`직원 등록 실패: ${errorMessage}`);
        }
        console.error("직원 등록 API 오류:", error);
        throw new Error("직원 등록 중 통신 오류가 발생했습니다.");
    }
};

/**
 * 매장 목록 조회 API 호출
 * @param storeId 조회할 특정 매장 ID (선택적)
 * @returns {Promise<Store[]>} 조회된 매장 목록
 */
export const getStores = async (storeId?: number): Promise<Store[]> => {
    try {
        // 백엔드 컨트롤러: @GetMapping("/store")
        // storeId가 있을 경우 쿼리 파라미터로 포함: /store?storeId=1
        const response = await axios.get(`${BASE_URL}/store`, {
            params: storeId ? { storeId } : undefined,
        });
        // 백엔드에서 List<Store>를 반환하므로, data는 Store[] 타입이 됩니다.
        return response.data; 
    } catch (error) {
        console.error("매장 조회 API 오류:", error);
        const errorMessage = axios.isAxiosError(error) && error.response 
            ? error.response.data || "매장 정보 조회 중 서버 오류가 발생했습니다." 
            : "매장 정보 조회 중 통신 오류가 발생했습니다.";
        throw new Error(errorMessage);
    }
};