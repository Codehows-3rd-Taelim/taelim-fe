import { create } from "zustand";
import axios from "axios";
import type { LoginResponse } from "./type";

// Store 상태 타입
type AuthStore = {
  jwtToken: string | null;
  roleLevel: LoginResponse["roleLevel"] | null;
  storeId: LoginResponse["storeId"] | null;

  isAuthenticated: boolean;

  login: (params: LoginResponse) => void;
  logout: () => void;
};

// LocalStorage 초기값 로드
const initialState = (): Pick<
  AuthStore,
  "jwtToken" | "roleLevel" | "storeId" | "isAuthenticated"
> => {
  const jwtToken = localStorage.getItem("jwtToken");
  const roleLevel = localStorage.getItem("roleLevel");
  const storeId = localStorage.getItem("storeId");

  return {
    jwtToken,
    roleLevel: roleLevel ? Number(roleLevel) : null,
    storeId: storeId ? Number(storeId) : null,
    isAuthenticated: !!jwtToken,
  };
};

// Zustand Store 생성
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState(),

  login: ({ jwtToken, roleLevel, storeId }) => {
    localStorage.setItem("jwtToken", jwtToken);
    localStorage.setItem("roleLevel", String(roleLevel));
    localStorage.setItem("storeId", String(storeId));

    set({
      jwtToken,
      roleLevel,
      storeId,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("roleLevel");
    localStorage.removeItem("storeId");

    set({
      jwtToken: null,
      roleLevel: null,
      storeId: null,
      isAuthenticated: false,
    });

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  },
}));

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
      alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
      auth.logout();
    }

    return Promise.reject(error);
  }
);