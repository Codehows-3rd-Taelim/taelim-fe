import axios from "axios";
import type { ApiFormUser, PaginationResponse, User } from "../../type";
import { endpoints } from "../../api/endpoints";

/**
 * ID 중복 확인 API 호출
 * @param id 확인할 로그인 ID
 * @returns {Promise<{exists: boolean}>} 중복 여부 객체
 */
export const checkDuplicateId = async (
  id: string
): Promise<{ exists: boolean }> => {
  if (!id.trim()) {
    throw new Error("ID를 입력해주세요.");
  }

  try {
    const response = await axios.get(endpoints.users.checkLogin, {
      params: { loginId: id.trim() },
    });
    return response.data;
  } catch (error) {
    console.error("ID 중복 확인 API 오류:", error);
    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? error.response.data?.message || "아이디 중복 확인 중 서버 오류가 발생했습니다."
        : "아이디 중복 확인 중 서버 오류가 발생했습니다.";
    throw new Error(errorMessage);
  }
};

/**
 * 직원 등록 API 호출
 * @param userData 등록할 직원 데이터 (ApiFormUser 형식)
 * @returns {Promise<User>} 생성된 직원 정보
 */
export const registerEmployee = async (
  userData: ApiFormUser
): Promise<User> => {
  try {
    const response = await axios.post<User>(endpoints.users.base, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || "알 수 없는 등록 오류";
      throw new Error(`직원 등록 실패: ${errorMessage}`);
    }
    console.error("직원 등록 API 오류:", error);
    throw new Error("직원 등록 중 통신 오류가 발생했습니다.");
  }
};

/**
 * 직원 목록 조회 API 호출
 * @param page 페이지 번호
 * @param size 페이지 크기
 * @param storeId 조회할 특정 매장 ID (선택적)
 * @returns {Promise<PaginationResponse<User>>} 조회된 직원 목록 (페이징)
 */
export const getUsers = async ({
  page,
  size,
  storeId,
}: {
  page: number;
  size: number;
  storeId?: number;
}): Promise<PaginationResponse<User>> => {
  try {
    const response = await axios.get<PaginationResponse<User>>(endpoints.stores.users, {
      params: {
        page,
        size,
        ...(storeId && { storeId }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("직원 목록 조회 API 오류:", error);
    throw new Error("직원 목록 조회 중 오류 발생");
  }
};

/**
 * 직원 정보 업데이트 API 호출
 * @param userId 수정할 직원의 고유 ID
 * @param userData 수정할 직원 데이터
 * @returns {Promise<User>} 업데이트된 직원 정보
 */
export const updateEmployee = async (
  userId: number,
  userData: Partial<User>
): Promise<User> => {
  const payload = {
    loginId: userData.loginId,
    password: userData.password,
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
    storeId: userData.storeId,
    role: userData.role,
  };

  try {
    const response = await axios.put<User>(endpoints.users.byId(userId), payload);
    return response.data;
  } catch (error) {
    console.error("직원 업데이트 API 오류:", error);
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || "알 수 없는 업데이트 오류";
      throw new Error(`직원 업데이트 실패: ${errorMessage}`);
    }
    throw new Error("직원 업데이트 중 통신 오류가 발생했습니다.");
  }
};

/**
 * 직원 삭제 API 호출
 * @param userId 삭제할 직원의 고유 ID (PK)
 * @returns {Promise<void>}
 */
export const deleteEmployee = async (userId: number): Promise<void> => {
  try {
    await axios.delete(endpoints.users.byId(userId));
  } catch (error) {
    console.error("직원 삭제 API 오류:", error);

    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? error.response.data?.message ||
          `직원 삭제 중 서버 오류가 발생했습니다. (ID: ${userId})`
        : `직원 삭제 중 통신 오류가 발생했습니다. (ID: ${userId})`;

    throw new Error(errorMessage);
  }
};
