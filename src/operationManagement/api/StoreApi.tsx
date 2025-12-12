import axios from "axios";
import type { Industry, Store } from "../../type";
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
        const response = await axios.get(`${BASE_URL}/store/list`, {
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