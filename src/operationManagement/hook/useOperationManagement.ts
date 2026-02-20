import { useEffect, useState, useMemo } from "react";
import type { User, Store, ApiFormUser } from "../../type";
import { getStores } from "../api/StoreApi";
import { checkDuplicateId, getUsers, registerEmployee } from "../api/EmployeeApi";
import { useAuthStore } from "../../store";
import { ROLE_LEVEL, MAX_STORE_FETCH } from "../../lib/constants";

type LocalUserForm = ApiFormUser & { pwCheck: string };

export default function useOperationManagement() {
    // 탭
    const [activeTab, setActiveTab] = useState<'employee' | 'store'>('employee');

    // 패스워드 가시성
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    // 인증 및 사용자 정보
    const { jwtToken, roleLevel: rawRoleLevel, storeId: rawStoreId, isAuthenticated } = useAuthStore();
    const roleLevel = rawRoleLevel ?? -1;
    const userStoreId = rawStoreId ?? 0;
    
    // 인증 상태를 나타내는 user 객체 (여기서는 단순히 인증 여부 판단용)
    const user = isAuthenticated ? { roleLevel, storeId: userStoreId } : null;

    // 매장/직원 목록
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [list, setList] = useState<User[]>([]);

    // ID 중복
    const [isIdChecked, setIsIdChecked] = useState(false);

    // 폼 상태
    const getInitialForm = (): LocalUserForm => ({
        id: "",
        pw: "",
        pwCheck: "",
        name: "",
        phone: "",
        email: "",
        role: roleLevel === ROLE_LEVEL.MANAGER ? "USER" : "MANAGER", // 매장 담당자(2)는 등록 시 USER가 디폴트, 관리자(3)는 MANAGER가 디폴트
        storeId: roleLevel === ROLE_LEVEL.ADMIN ? 0 : userStoreId,
    });

    const [form, setForm] = useState<LocalUserForm>(getInitialForm());

    // 공통 데이터 로딩
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
        const storeIdToFetch = roleLevel === ROLE_LEVEL.ADMIN ? undefined : userStoreId;

        try {
            const response = await getStores(1, MAX_STORE_FETCH);
            setAllStores(response.content); // PaginationDTO.content 사용
        } catch (err) {
            console.error("매장 목록 로드 실패", err);
            setAllStores([]);
        } finally {
            setLoadingStores(false);
        }

        // 직원 목록
        try {
            const users = await getUsers({
              page: 1,
              size: MAX_STORE_FETCH,
              storeId: storeIdToFetch,
            });
            setList(users.content);
        } catch (err) {
            console.error("직원 목록 로드 실패", err);
            setList([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    loadData();
}, [roleLevel, userStoreId, isAuthenticated]);


    const currentStoreName = useMemo(() => {
        // 1. 매장 로딩이 완료되었는지 확인
        if (loadingStores) return "매장 정보 로딩 중...";

        // 2. 관리자(roleLevel 3)일 경우
        if (roleLevel === ROLE_LEVEL.ADMIN) return "통합 관리자";

        // 3. 일반 사용자/매니저일 경우, allStores에서 userStoreId와 일치하는 매장 찾기
        const store = allStores.find(s => s.storeId === userStoreId);
        
        // 4. 매장 이름 반환
        return store ? store.shopName : "매장 정보를 찾을 수 없습니다.";
    }, [allStores, userStoreId, roleLevel, loadingStores]);

    // 공통 핸들러
    const setFormValue = (name: string, value: string | number) => {
        if (name === "id") setIsIdChecked(false);
        setForm(prev => ({ ...prev, [name]: name === "storeId" ? Number(value) : value }));
    };

    const handleIdCheck = async () => {
        if (!form.id.trim()) {
            alert("ID를 입력하세요.");
            return;
        }
        try {
            const data = await checkDuplicateId(form.id);
            if (data.exists) {
                alert("이미 사용 중인 ID");
                setIsIdChecked(false);
            } else {
                alert("사용 가능한 ID");
                setIsIdChecked(true);
            }
        } catch (err) {
            console.error(err);
            alert("ID 확인 실패");
            setIsIdChecked(false);
        }
    };

    // 파생 상태
    const isPasswordMismatched = form.pwCheck.length > 0 && form.pw !== form.pwCheck;
    const isPasswordValid = form.pw.length > 0 && form.pw === form.pwCheck;
    const isFormFilled = Boolean(form.id && form.pw && form.name && form.email && form.storeId);

    const isRegisterButtonEnabled =
        roleLevel !== ROLE_LEVEL.USER &&
        isIdChecked &&
        isPasswordValid &&
        isFormFilled;

    const handleRegister = async () => {
        if (!isRegisterButtonEnabled) {
            alert("입력값을 확인해주세요.");
            throw new Error("입력값 검증 실패"); // 에러를 던져서 모달이 닫히지 않도록
        }

        const { pwCheck: _pwCheck, ...payload } = form;

        try {
            const msg = await registerEmployee(payload);
            alert(msg);
            setForm(getInitialForm());
            setIsIdChecked(false);

            const storeIdToFetch = roleLevel === ROLE_LEVEL.ADMIN ? undefined : userStoreId;
            const updated = await getUsers({
              page: 1,
              size: MAX_STORE_FETCH,
              storeId: storeIdToFetch,
            });
            setList(updated.content);
            // 성공 시 에러를 던지지 않음
        } catch (err) {
            console.error(err);
            alert("직원 등록 실패");
            throw err; // 에러를 다시 던져서 모달이 닫히지 않도록
        }
    };

    const handleLogout = () => {
        useAuthStore.getState().logout();
    };

    const getStoreName = (storeId: number) =>
        allStores.find((s) => s.storeId === storeId)?.shopName || "";

    const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleRegister();
    };

    // 반환
    return {
        // 추가된 인증 상태
        user, // OperationManagement 컴포넌트에서 인증 여부 확인에 사용

        loadingStores,
        loadingUsers,

        // 상태
        form,
        allStores,
        list,
        roleLevel,
        activeTab,
        showPassword,
        showPasswordCheck,
        isIdChecked,
        isPasswordMismatched,
        isPasswordValid,
        isRegisterButtonEnabled,
        currentStoreName,

        // 함수
        setFormValue,
        setIsIdChecked,
        handleIdCheck,
        handleRegister,
        handleLogout,
        getStoreName,
        setActiveTab,
        setShowPassword,
        setShowPasswordCheck,
        handlePasswordKeyPress,
        setList,
    };
}