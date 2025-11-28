import axios from "axios";
import type { LoginRequest, LoginResponse } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAuthToken = async (user: LoginRequest): Promise<LoginResponse> => {
    console.log(`${BASE_URL}/login`);
    const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, user);
    return response.data;
};
