import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User, Store, ApiFormUser } from "../../type";
import { checkDuplicateId, registerEmployee, getUsers } from "../api/EmployeeApi";
import { getStores } from "../api/StoreApi";

type LocalUserForm = ApiFormUser & { pwCheck: string };

export default function useOperationManagement() {
    const navigate = useNavigate();

    // 탭
    const [activeTab, setActiveTab] = useState<'employee' | 'store'>('employee');

    // 패스워드 가시성
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    // 인증 및 사용자 정보 
    const jwtToken = localStorage.getItem("jwtToken"); // JWT 토큰 확인
    
    // roleLevel, storeId는 인증된 사용자 정보의 일부로 간주합니다.
    const rawRoleLevel = localStorage.getItem("roleLevel");
    const roleLevel = rawRoleLevel ? Number(rawRoleLevel) : -1;

    const rawStoreId = localStorage.getItem("storeId");
    const userStoreId = rawStoreId ? Number(rawStoreId) : 0;
    
    // 인증 상태를 나타내는 user 객체 (여기서는 단순히 인증 여부 판단용)
    // 실제 애플리케이션에서는 userStoreId, roleLevel, id 등을 포함하는 객체여야 합니다.
    const user = jwtToken ? { roleLevel, storeId: userStoreId } : null; 

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
        // roleLevel이 3(관리자)이면 기본값 MANAGER, 아니면 USER로 설정하는 것이 더 일반적일 수 있습니다.
        // 현재 로직을 유지하면서 roleLevel에 따라 기본값을 설정합니다.
        role: roleLevel === 2 ? "USER" : "MANAGER", // 매장 담당자(2)는 등록 시 USER가 디폴트, 관리자(3)는 MANAGER가 디폴트
        storeId: roleLevel === 3 ? 0 : userStoreId,
    });

    const [form, setForm] = useState<LocalUserForm>(getInitialForm());

    // 1.인증 확인 및 리디렉션
    useEffect(() => {
        if (!jwtToken) {
            // 토큰이 없으면 로그인 페이지로 이동
            navigate("/login", { replace: true });
        }
    }, [jwtToken, navigate]);


    // 2.공통 데이터 로딩
    useEffect(() => {
        // 인증되지 않았으면 데이터 로딩을 시도하지 않음
        if (!jwtToken) return;

        const loadData = async () => {
            const storeIdToFetch = roleLevel === 3 ? undefined : userStoreId;

            // 매장
            try {
                const stores = await getStores(storeIdToFetch);
                setAllStores(stores);
            } catch (err) {
                console.error("매장 목록 로드 실패", err);
                setAllStores([]);
            } finally {
                setLoadingStores(false);
            }

            // 직원
            try {
                const users = await getUsers(storeIdToFetch);
                setList(users);
            } catch (err) {
                console.error("직원 목록 로드 실패", err);
                setList([]);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadData();
    }, [roleLevel, userStoreId, jwtToken]); // jwtToken이 변경되면 다시 로드

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
        roleLevel !== 1 &&
        isIdChecked &&
        isPasswordValid &&
        isFormFilled;

    const handleRegister = async () => {
        if (!isRegisterButtonEnabled) {
            alert("입력값을 확인해주세요.");
            return;
        }

        const { pwCheck: _pwCheck, ...payload } = form;

        try {
            const msg = await registerEmployee(payload);
            alert(msg);
            setForm(getInitialForm());
            setIsIdChecked(false);

            const storeIdToFetch = roleLevel === 3 ? undefined : userStoreId;
            const updated = await getUsers(storeIdToFetch);
            setList(updated);
        } catch (err) {
            console.error(err);
            alert("직원 등록 실패");
        }
    };

    const handleLogout = () => {
        // 모든 인증 정보 삭제
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("roleLevel");
        localStorage.removeItem("storeId");
        // 리디렉션
        navigate("/login", { replace: true });
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

        // 함수
        setFormValue,
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