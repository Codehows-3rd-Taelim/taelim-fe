import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User, Store, ApiFormUser } from "../../type"; 
import { checkDuplicateId, getStores, registerEmployee, getUsers } from "../api/EmployeeApi";
import OperationDesktopLayout from "./OperationDesktopLayout"; 
import OperationMobileLayout from "./OperationMobileLayout"; 

// LocalUserForm 타입은 OperationManagement.tsx에 유지
type LocalUserForm = ApiFormUser & {
    pwCheck: string; // 비밀번호 확인 필드
};

// OperationManagement 컴포넌트
export default function OperationManagement() {
    const navigate = useNavigate();

    // 모바일 반응형 상태
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 현재 활성화된 탭 상태 ('employee' 또는 'store')
    const [activeTab, setActiveTab] = useState<'employee' | 'store'>('employee');

    // 비밀번호 가시성 상태 (두 필드에 대해 각각)
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);
    
    // 권한 정보
    const rawRoleLevel = localStorage.getItem("roleLevel");

    // roleLevel: 3=ADMIN, 2=MANAGER, 1=USER
    const roleLevel: number = rawRoleLevel ? Number(rawRoleLevel) : -1;
    const rawStoreId = localStorage.getItem("storeId");
    const userStoreId: number = rawStoreId ? Number(rawStoreId) : 0;

    // API를 통해 가져올 매장 목록 상태
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);

    // 직원 목록 로딩 상태
    const [loadingUsers, setLoadingUsers] = useState(true);

    // ID 중복 확인 상태 추가
    const [isIdChecked, setIsIdChecked] = useState(false);

    // 폼 상태 및 초기화 로직
    const getInitialForm = (): LocalUserForm => ({
        id: "",
        pw: "",
        pwCheck: "",
        name: "",
        phone: "",
        email: "",
        role: roleLevel === 2 ? "MANAGER" : "USER", // ADMIN이 아니면 기본 역할 설정
        storeId: roleLevel === 3 ? 0 : userStoreId, // ADMIN(3)이면 0(선택 안함), 아니면 본인 매장
    });
    const [form, setForm] = useState<LocalUserForm>(getInitialForm());

    // 목록 상태 (EmployeePage로 전달) - 초기값은 빈 배열
    const [list, setList] = useState<User[]>([]);
    
    // 화면 크기 감지 로직
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 매장 목록 및 직원 목록 로드 로직
    useEffect(() => {
        const loadData = async () => {
            let storeIdToFetch: number | undefined;
            
            // ADMIN(3)이면 undefined를 전달하여 모든 매장/직원 조회를 요청
            if (roleLevel === 3) {
                storeIdToFetch = undefined;
            } 
            // MANAGER(2)나 USER(1)이고 유효한 storeId가 있으면 해당 storeId를 전달
            else {
                storeIdToFetch = userStoreId;
            }
            
            // 1. 매장 목록 로드
            try {
                // ADMIN이면 모든 매장, 아니면 userStoreId로 필터링된 매장 목록을 요청
                const data = await getStores(roleLevel === 3 ? undefined : userStoreId); 
                setAllStores(data);
            } catch (err) {
                console.error("매장 목록 로드 실패:", err);
                alert("매장 목록을 가져오는 데 실패했습니다.");
                setAllStores([]);
            } finally {
                setLoadingStores(false);
            }
            
            // 2. 직원 목록 로드
            setLoadingUsers(true);
            try {
                // storeIdToFetch 변수는 ADMIN(undefined) 또는 해당 매장 ID(number)를 포함합니다.
                const userData = await getUsers(storeIdToFetch);
                setList(userData);
            } catch (err) {
                console.error("직원 목록 로드 실패:", err);
                alert("직원 목록을 가져오는 데 실패했습니다.");
                setList([]);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadData();
    }, [roleLevel, userStoreId]);

    // 상태 변경을 위한 통합 핸들러 (레이아웃 컴포넌트에 전달)
    const setFormValue = (name: string, value: string | number) => {
        if (name === "id") {
            setIsIdChecked(false);
        }
        setForm({ ...form, [name]: name === "storeId" ? Number(value) : value });
    };

    // ✔ ID 중복확인
    const handleIdCheck = async () => {
        if (!form.id.trim()) {
            alert("ID를 입력해주세요.");
            setIsIdChecked(false);
            return;
        }
        try {
            const data = await checkDuplicateId(form.id);
            if (data.exists) {
                alert("이미 사용 중인 ID입니다.");
                setIsIdChecked(false);
            } else {
                alert("사용 가능한 ID입니다.");
                setIsIdChecked(true);
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "ID 중복 확인 중 알 수 없는 오류가 발생했습니다.");
            setIsIdChecked(false);
        }
    };

    // 파생 상태 계산
    const isPasswordMismatched = form.pwCheck.length > 0 && form.pw !== form.pwCheck;
    const isPasswordValid = form.pw.length > 0 && form.pw === form.pwCheck;
    const isFormFilled = Boolean(
        form.id && form.pw && form.name && form.email && form.storeId
    );
    const isRegisterButtonEnabled =
        roleLevel !== 1 && // 권한 레벨 1(USER)는 등록 불가
        isIdChecked && // ID 중복 확인 완료
        isPasswordValid && // 비밀번호 유효성 검사 (일치) 완료
        isFormFilled; // 필수 필드 모두 입력

    // 직원 등록
    const handleRegister = async () => {
        if (roleLevel === 1) return; // 조회만 가능

        if (!isRegisterButtonEnabled) {
            if (!isIdChecked) {
                alert("ID 중복 확인을 해주세요.");
            } else if (!isPasswordValid) {
                alert("비밀번호가 일치하지 않거나 입력되지 않았습니다.");
            } else if (!isFormFilled) {
                alert("모든 필수 필드를 입력해주세요.");
            }
            return;
        }
        // ApiFormUser 타입에 맞춰 API 요청 데이터 구성
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pwCheck: _pwCheck, ...newUserApiData } = form;

        try {
            const message = await registerEmployee(newUserApiData);
            alert(message);

            // 등록 성공 시 폼 초기화 후 직원 목록을 다시 불러오는 것이 가장 안전합니다.
            setForm(getInitialForm());
            setIsIdChecked(false);
            
            // 목록 새로고침: 데이터 무결성을 위해 서버에서 목록을 다시 가져옵니다.
            setLoadingUsers(true);
            try {
                const storeIdToFetch = roleLevel === 3 ? undefined : userStoreId;
                const updatedList = await getUsers(storeIdToFetch);
                setList(updatedList);
            } catch (reloadErr) {
                console.error("등록 후 목록 재로드 실패:", reloadErr);
                alert("직원 등록은 성공했으나, 목록을 업데이트하지 못했습니다. 새로고침 해주세요.");
            } finally {
                setLoadingUsers(false);
            }

        } catch (err) {
            alert(err instanceof Error ? err.message : "직원 등록 중 알 수 없는 오류가 발생했습니다.");
        }
    };
    
    // 로그아웃
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("roleLevel");
        localStorage.removeItem("storeId");
        navigate("/login", { replace: true });
    };

    // 스토어 이름 조회
    const getStoreName = (storeId: number): string => {
        return allStores.find((s) => s.storeId === storeId)?.shopName || "";
    };

    // 엔터 키 입력 핸들러
    const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleRegister();
        }
    };

    // 로딩 중 UI
    if (loadingStores || loadingUsers) {
        return <div style={{ padding: "30px", textAlign: "center" }}>매장 및 직원 정보를 불러오는 중입니다...</div>;
    }

    // 💡 모든 상태/함수를 포함하는 Prop 객체 구성
    const commonProps = {
        // 상태/데이터
        form,
        isIdChecked,
        isPasswordMismatched,
        isPasswordValid,
        isRegisterButtonEnabled,
        allStores,
        roleLevel,
        activeTab,
        showPassword,
        showPasswordCheck,
        list, // EmployeePage 용

        // 핸들러/액션
        setFormValue, // 상태 변경을 위한 통합 핸들러
        handleIdCheck,
        handleRegister,
        handleLogout,
        setActiveTab,
        getStoreName,
        handlePasswordKeyPress,
        setShowPassword,
        setShowPasswordCheck,
        setList, // EmployeePage 용 (직원 목록을 로컬로 관리할 때 삭제 기능 등에 사용)
    };

    // 💡 분리된 레이아웃 컴포넌트 렌더링
    return (
        <div style={{ padding: "0px" }}>
            {isMobile ? (
                <OperationMobileLayout {...commonProps} />
            ) : (
                <OperationDesktopLayout {...commonProps} />
            )}
        </div>
    );
}