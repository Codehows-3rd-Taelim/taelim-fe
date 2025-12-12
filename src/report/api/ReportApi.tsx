import axios from "axios";
import type { Report } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ReportParams {
  storeId?: number;
  startDate?: string;
  endDate?: string;
}

// 리포트 가져오기
export const getReport = async (
  storeId?: number,
  startDate?: string,
  endDate?: string
): Promise<Report[]> => {
    try {
        const params: ReportParams = {
            ...(storeId && { storeId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        };

        console.log("🌐 API 호출 파라미터:", params);

        const response = await axios.get(`${BASE_URL}/report/list`, {
            params,
        });

        console.log("✅ API 응답 받음:", response.data.length, "개");

        return response.data; 
    } catch (error) {
        console.error("보고서 조회 API 오류:", error);
        const errorMessage = axios.isAxiosError(error) && error.response 
            ? error.response.data || "보고서 조회 중 서버 오류가 발생했습니다." 
            : "보고서 조회 중 통신 오류가 발생했습니다.";
        throw new Error(errorMessage);
    }
};