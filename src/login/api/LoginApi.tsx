import axios from "axios";
import type { LoginRequest, LoginResponse } from "../../type";
import { endpoints } from "../../api/endpoints";

export const getAuthToken = async (user: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(endpoints.auth.login, user);
    return response.data;
};
