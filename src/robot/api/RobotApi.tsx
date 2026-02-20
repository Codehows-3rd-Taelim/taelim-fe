import axios from "axios";
import type { Robot } from "../../type";
import { endpoints } from "../../api/endpoints";

export const getRobots = async (storeId?: number, signal?: AbortSignal): Promise<Robot[]> => {
    try {
        const response = await axios.get<Robot[]>(endpoints.robots, {
            params: storeId ? { storeId } : undefined,
            signal,
        });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) throw error;
        console.error("로봇 조회 API 오류:", error);
        throw new Error("로봇 조회 중 오류가 발생했습니다.");
    }
};