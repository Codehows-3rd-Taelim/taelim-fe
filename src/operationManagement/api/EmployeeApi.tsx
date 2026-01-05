import axios from "axios";
import type { ApiFormUser, PaginationResponse, User } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * ID 중복 확인 API 호출
 * @param id 확인할 로그인 ID (DTO 필드명은 'id'이지만, API 경로상 loginId로 받는다고 가정하고 전달)
 * @returns {Promise<{exists: boolean}>} 중복 여부 객체
 */
// **주의:** 백엔드에서 '/signup/check_loginid'를 통해 DTO의 'id' 필드를 받는지 확인 필요
export const checkDuplicateId = async (
  id: string
): Promise<{ exists: boolean }> => {
  if (!id.trim()) {
    throw new Error("ID를 입력해주세요.");
  }

  try {
    // DTO 필드가 'id'이지만, 엔드포인트 URL이 'check_loginid'이므로 params 키를 'id'로 설정합니다.
    const response = await axios.get(`${BASE_URL}/user/check_loginid`, {
      params: { id: id.trim() },
    });
    return response.data;
  } catch (error) {
    console.error("ID 중복 확인 API 오류:", error);
    // AxiosError에서 응답 본문이 있으면 사용
    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? error.response.data || "아이디 중복 확인 중 서버 오류가 발생했습니다."
        : "아이디 중복 확인 중 서버 오류가 발생했습니다.";
    throw new Error(errorMessage);
  }
};

/**
 * 직원 등록 API 호출
 * @param userData 등록할 직원 데이터 (ApiFormUser 형식)
 * @returns {Promise<string>} 성공 시 메시지
 */
export const registerEmployee = async (
  userData: ApiFormUser
): Promise<string> => {
  try {
    // ApiFormUser를 그대로 전송 (필드명 'id'와 'pw' 사용)
    const response = await axios.post(`${BASE_URL}/user/signup`, userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data || "알 수 없는 등록 오류";
      throw new Error(`직원 등록 실패: ${errorMessage}`);
    }
    console.error("직원 등록 API 오류:", error);
    throw new Error("직원 등록 중 통신 오류가 발생했습니다.");
  }
};

/**
 * 직원 목록 조회 API 호출 (새로 추가)
 * 백엔드 CheckController.checkUser와 통신합니다.
 * @param storeId 조회할 특정 매장 ID (선택적)
 * @returns {Promise<User[]>} 조회된 직원 목록
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
    const response = await axios.get(`${BASE_URL}/store/user`, {
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
  const url = `${BASE_URL}/user/${userId}`;

  const payload = {
    id: userData.id,
    pw: userData.pw,
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
    storeId: userData.storeId,
    role: userData.role,
  };

  try {
    const response = await axios.put<User>(url, payload);
    return response.data;
  } catch (error) {
    console.error("직원 업데이트 API 오류:", error);
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data || "알 수 없는 업데이트 오류";
      throw new Error(`직원 업데이트 실패: ${errorMessage}`);
    }
    throw new Error("직원 업데이트 중 통신 오류가 발생했습니다.");
  }
};

/**
 * 직원 삭제 API 호출 (새로 추가)
 * 백엔드 EmployeeController.deleteEmployee와 통신합니다.
 * @param userId 삭제할 직원의 고유 ID (PK)
 * @returns {Promise<string>} 성공 시 메시지
 */
export const deleteEmployee = async (userId: number): Promise<string> => {
  try {
    // 백엔드 컨트롤러: @DeleteMapping("/employees/{userId}")
    // BASE_URL/employees/{userId} 경로로 DELETE 요청 전송
    const response = await axios.delete(`${BASE_URL}/user/${userId}`);

    // 백엔드에서 반환된 성공 메시지를 프론트엔드로 전달
    return response.data;
  } catch (error) {
    console.error("직원 삭제 API 오류:", error);

    // AxiosError에서 응답 본문이 있으면 사용
    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? error.response.data ||
          `직원 삭제 중 서버 오류가 발생했습니다. (ID: ${userId})`
        : `직원 삭제 중 통신 오류가 발생했습니다. (ID: ${userId})`;

    throw new Error(errorMessage);
  }
};
