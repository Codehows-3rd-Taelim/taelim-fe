import axios from "axios";
import type { Industry, PaginationResponse, Store } from "../../type";
import { endpoints } from "../../api/endpoints";

/**
 * 매장 목록 조회 API 호출
 * @param storeId 조회할 특정 매장 ID (선택적)
 * @returns {Promise<Store[]>} 조회된 매장 목록
 */
export const getStores = async (
  page: number,
  size: number,
  signal?: AbortSignal
): Promise<PaginationResponse<Store>> => {
  try {
    const response = await axios.get<PaginationResponse<Store>>(endpoints.stores.base, {
      params: { page, size },
      signal,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error("매장 조회 API 오류:", error);
    throw new Error("매장 정보 조회 중 오류가 발생했습니다.");
  }
};

export const getIndustry = async (): Promise<Industry[]> => {
  try {
    const response = await axios.get<Industry[]>(endpoints.industries);
    return response.data;
  } catch (error) {
    const message =
      axios.isAxiosError(error) && error.response
        ? error.response.data?.message
        : "업종 정보 조회 중 오류가 발생했습니다.";
    throw new Error(message);
  }
};

// 업종 변경/선택시 호출
export async function updateStore(
  storeId: number,
  storeData: Partial<Store>
): Promise<Store> {
  const payload = {
    shopId: storeData.shopId,
    shopName: storeData.shopName,
    industryId: storeData.industryId,
  };

  try {
    const response = await axios.put<Store>(endpoints.stores.byId(storeId), payload);
    return response.data;
  } catch (error) {
    console.error("매장 업데이트 API 오류:", error);
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || "알 수 없는 업데이트 오류";
      throw new Error(`매장 업데이트 실패: ${errorMessage}`);
    }
    throw new Error("매장 업데이트 중 통신 오류가 발생했습니다.");
  }
}
