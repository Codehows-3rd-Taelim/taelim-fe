import axios from "axios";
import type { Robot } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

export const getRobots = async (storeId?: number): Promise<Robot[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/robot/list`, {
            params: storeId ? { storeId } : undefined,
        });
        return response.data;
    } catch (error) {
        console.error("로봇 조회 API 오류:", error);
        throw new Error("로봇 조회 중 오류가 발생했습니다.");
    }
};