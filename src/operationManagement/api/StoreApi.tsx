import axios from "axios";
import type { Industry, Store } from "../../type";

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

// 🚀 2. 응답 인터셉터 추가: 토큰 만료 처리 로직
axios.interceptors.response.use(
    (response) => {
        // 성공적인 응답은 그대로 반환
        return response;
    },
    (error) => {
        const { response } = error;
        
        // 서버에서 401 (Unauthorized) 또는 403 (Forbidden) 응답을 받았을 때 처리
        if (response && (response.status === 401 || response.status === 403)) {
            console.error("JWT 토큰 만료 또는 권한 부족 감지. 로그아웃 처리 시작.");
            alert("자동 로그인 키(접속 허가증)가 만료되어 로그인 화면으로 이동합니다.");
            
            // 1. LocalStorage의 토큰 정보 삭제
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("roleLevel");
            localStorage.removeItem("storeId");
            
            // 2. 로그인 페이지로 강제 리디렉션
            // 현재 페이지가 로그인 페이지가 아닌 경우에만 이동
            if (window.location.pathname !== '/login') {
                // window.location.replace를 사용하여 브라우저 히스토리에 현재 페이지를 남기지 않고 이동
                window.location.replace('/login'); 
            }
            
            // 에러 전파를 막아 해당 API를 호출한 컴포넌트에서 불필요한 에러 처리를 방지
            return Promise.reject(new Error("Token expired, unauthorized, or redirecting to login."));
        }
        
        return Promise.reject(error);
    }
);

const BASE_URL = import.meta.env.VITE_API_URL;

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

export const getIndustry = async (): Promise<Industry[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/store/industry`);
        return response.data as Industry[];
    } catch (error) {
        const message =
            axios.isAxiosError(error) && error.response
                ? error.response.data
                : "업종 정보 조회 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

// 업종 변경/선택시 호출
export async function updateStore(storeId: number, storeData: Partial<Store>): Promise<Store> {
    const url = `${BASE_URL}/store/${storeId}`;
    
    // axios는 payload를 자동으로 JSON 직렬화하여 전송합니다.
    const payload = {
        shopId: storeData.shopId,
        shopName: storeData.shopName,
        industryId: storeData.industryId
    };

    try {
        const response = await axios.put<Store>(url, payload);
        return response.data;
    } catch (error) {
        console.error("매장 업데이트 API 오류:", error);
        if (axios.isAxiosError(error) && error.response) {
            // 백엔드에서 반환된 data (에러 메시지)를 사용하거나 기본 메시지를 사용
            const errorMessage = error.response.data || "알 수 없는 업데이트 오류";
            throw new Error(`매장 업데이트 실패: ${errorMessage}`);
        }
        throw new Error("매장 업데이트 중 통신 오류가 발생했습니다.");
    }
}