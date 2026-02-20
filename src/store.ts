import { create } from "zustand";
import axios from "axios";
import type { LoginResponse } from "./type";

// Store 상태 타입
type AuthStore = {
  jwtToken: string | null;
  roleLevel: LoginResponse["roleLevel"] | null;
  storeId: LoginResponse["storeId"] | null;
  userId: LoginResponse["userId"] | null;

  isAuthenticated: boolean;

  login: (params: LoginResponse) => void;
  logout: () => void;
};

// LocalStorage 초기값 로드
const initialState = (): Pick<
  AuthStore,
  "jwtToken" | "roleLevel" | "storeId" | "userId" | "isAuthenticated"
> => {
  const jwtToken = localStorage.getItem("jwtToken");
  const roleLevel = localStorage.getItem("roleLevel");
  const storeId = localStorage.getItem("storeId");
  const userId = localStorage.getItem("userId");

  return {
    jwtToken,
    roleLevel: roleLevel ? Number(roleLevel) : null,
    storeId: storeId ? Number(storeId) : null,
    userId: userId ? Number(userId) : null,
    isAuthenticated: !!jwtToken,
  };
};

// Zustand Store 생성
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState(),

  login: ({ jwtToken, roleLevel, storeId, userId }) => {
    localStorage.setItem("jwtToken", jwtToken);
    localStorage.setItem("roleLevel", String(roleLevel));
    localStorage.setItem("storeId", String(storeId));
    localStorage.setItem("userId", String(userId));

    set({
      jwtToken,
      roleLevel,
      storeId,
      userId,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("roleLevel");
    localStorage.removeItem("storeId");
    localStorage.removeItem("userId");

    set({
      jwtToken: null,
      roleLevel: null,
      storeId: null,
      userId: null,
      isAuthenticated: false,
    });
    // 리다이렉트는 PrivateRoute의 <Navigate to="/login"> 또는 호출 측에서 처리
  },
}));

// fetch용 인증 래퍼 (SSE 등 axios를 쓰지 않는 API용)
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("jwtToken");
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 || res.status === 403) {
    useAuthStore.getState().logout();
    throw new Error("인증이 만료되었습니다.");
  }
  return res;
}

// Axios 인터셉터
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response } = error;
    const auth = useAuthStore.getState();

    if (response && (response.status === 401 || response.status === 403)) {
      auth.logout();
    }

    return Promise.reject(error);
  }
);