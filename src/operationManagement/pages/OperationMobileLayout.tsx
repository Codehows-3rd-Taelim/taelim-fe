import React from "react";
import EmployeePage from "./EmployeePage";
import PasswordToggle from "../../components/PasswordToggle";
import type { User, Store } from "../../type"; 

// 임시 StorePage 컴포넌트
const StorePage = () => <div style={{ padding: '20px', border: '1px solid #ddd' }}>매장 목록 영역 (StorePage.tsx)</div>; 

// 변수 정의
const INPUT_HEIGHT = "50px";

// Prop 타입 정의 (isPasswordValid 제거)
type OperationLayoutProps = {
    form: {
        id: string;
        pw: string;
        pwCheck: string;
        name: string;
        phone: string;
        email: string;
        role: "USER" | "MANAGER";
        storeId: number;
    };
    isIdChecked: boolean;
    isPasswordMismatched: boolean;
    isRegisterButtonEnabled: boolean;
    allStores: Store[];
    roleLevel: number;
    activeTab: 'employee' | 'store';
    showPassword: boolean;
    showPasswordCheck: boolean;
    list: User[];
    
    // 핸들러
    setFormValue: (name: string, value: string | number) => void;
    handleIdCheck: () => Promise<void>;
    handleRegister: () => Promise<void>;
    handleLogout: () => void;
    setActiveTab: (tab: 'employee' | 'store') => void;
    getStoreName: (storeId: number) => string;
    handlePasswordKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    setShowPassword: (show: boolean) => void;
    setShowPasswordCheck: (show: boolean) => void;
    setList: React.Dispatch<React.SetStateAction<User[]>>;
};


export default function OperationMobileLayout({
    form,
    isIdChecked,
    isPasswordMismatched,
    isRegisterButtonEnabled,
    allStores,
    roleLevel,
    activeTab,
    showPassword,
    showPasswordCheck,
    list,
    setFormValue,
    handleIdCheck,
    handleRegister,
    handleLogout,
    setActiveTab,
    getStoreName,
    handlePasswordKeyPress,
    setShowPassword,
    setShowPasswordCheck,
    setList
}: OperationLayoutProps) {

    // CSS 스타일
    const activeTabStyle: React.CSSProperties = {
        backgroundColor: "#FF8A00",
        color: "white",
        borderBottom: "none",
    };

    const inactiveTabStyle: React.CSSProperties = {
        backgroundColor: "#f0f0f0",
        color: "#333",
    };

    // 등록 버튼 JSX
    const RegisterButton = (
        <div style={{ width: '100%', flexShrink: 0, marginTop: "10px" }}>
            <button
                onClick={handleRegister}
                disabled={!isRegisterButtonEnabled}
                style={{
                    width: '100%',
                    backgroundColor: isRegisterButtonEnabled ? "#FF8A00" : "#ccc",
                    color: "#fff",
                    borderRadius: "6px",
                    border: "#d1d5db",
                    cursor: isRegisterButtonEnabled ? "pointer" : "not-allowed",
                    height: INPUT_HEIGHT,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                등록
            </button>
        </div>
    );

    // 모바일 전용 등록 폼 JSX (세로 스택 레이아웃)
    const employeeRegistrationForm = (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 1. ID + 중복확인 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: '100%' }}>
                <input
                    name="id"
                    value={form.id}
                    onChange={(e) => setFormValue('id', e.target.value)}
                    placeholder="ID (필수)"
                    className="input"
                    style={{ flexGrow: 1, boxSizing: "border-box", height: INPUT_HEIGHT }}
                />
                <button
                    onClick={handleIdCheck}
                    style={{
                        flexShrink: 0,
                        width: '100px',
                        height: INPUT_HEIGHT,
                        backgroundColor: isIdChecked ? "#7CB342" : "#FF8A00",
                        color: "white",
                         border: "#d1d5db",
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {isIdChecked ? "✓ 사용 가능" : "중복확인"}
                </button>
            </div>

            {/* 2. PW */}
            <div style={{ width: '100%', boxSizing: "border-box", height: INPUT_HEIGHT }}>
                <PasswordToggle
                    password={form.pw}
                    setPassword={(value) => setFormValue('pw', value)}
                    handleKeyPress={handlePasswordKeyPress}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />
            </div>

            {/* 3. PW 확인 필드 */}
            <div style={{ width: '100%', flexShrink: 0 }}>
                <PasswordToggle
                    password={form.pwCheck}
                    setPassword={(value) => setFormValue('pwCheck', value)}
                    handleKeyPress={handlePasswordKeyPress}
                    showPassword={showPasswordCheck}
                    setShowPassword={setShowPasswordCheck}
                />
                {isPasswordMismatched && (
                    <div style={{ color: "red", marginTop: "5px", fontSize: "12px" }}>비밀번호가 다릅니다</div>
                )}
            </div>

            {/* 4. 이름 */}
            <input
                name="name"
                value={form.name}
                onChange={(e) => setFormValue('name', e.target.value)}
                placeholder="이름 (필수)"
                className="input"
                style={{ width: '100%', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />

            {/* 5. 연락처 (phone) */}
            <input
                name="phone"
                value={form.phone}
                onChange={(e) => setFormValue('phone', e.target.value)}
                placeholder="연락처"
                className="input"
                style={{ width: '100%', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />

            {/* 6. 이메일 */}
            <input
                name="email"
                value={form.email}
                onChange={(e) => setFormValue('email', e.target.value)}
                placeholder="email@gmail.com (필수)"
                className="input"
                style={{ width: '100%', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />

            {/* 7. 매장명 */}
            <div style={{ width: '100%' }}>
                {roleLevel === 3 ? (
                    <select
                        name="storeId"
                        value={form.storeId}
                        onChange={(e) => setFormValue('storeId', Number(e.target.value))}
                        className="input"
                        style={{ width: "100%", height: INPUT_HEIGHT, boxSizing: "border-box" }}
                    >
                        <option value={0}>매장 선택 (필수)</option>
                        {allStores.map((s) => (
                            <option key={s.storeId} value={s.storeId}>
                                {s.shopName}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        value={getStoreName(form.storeId) || "매장 정보 없음"}
                        readOnly
                        disabled
                        placeholder="매장명"
                        className="input"
                        style={{ background: "#ffffff", padding: "8px", height: INPUT_HEIGHT, boxSizing: "border-box", width: "100%" }}
                    />
                )}
            </div>

            {/* 8. 권한 */}
            <div style={{ width: '100%' }}>
                {roleLevel === 3 ? (
                    <select
                        name="role"
                        value={form.role}
                        onChange={(e) => setFormValue('role', e.target.value)}
                        className="input"
                        style={{ width: "100%", height: INPUT_HEIGHT, boxSizing: "border-box" }}
                    >
                        <option value="MANAGER">매장 담당자</option>
                        <option value="USER">직원</option>
                    </select>
                ) : (
                    <input
                        value={form.role}
                        readOnly
                        disabled
                        placeholder="권한"
                        className="input"
                        style={{ background: "#ffffff", padding: "8px", height: INPUT_HEIGHT, boxSizing: "border-box", width: "100%" }}
                    />
                )}
            </div>

            {/* 9. 등록 버튼 (맨 아래) */}
            {RegisterButton}
        </div>
    );

    return (
        <>
            {/* 로그아웃 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#FF8A00",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    로그아웃
                </button>
            </div>

            {/* 직원 등록 폼 또는 권한 없음 메시지 */}
            {roleLevel !== 1 ? (
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>
                        직원 등록
                    </h3>
                    {employeeRegistrationForm}
                </div>
            ) : (
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        textAlign: "center",
                        minHeight: "100px", 
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#FF8A00" }}>
                        직원 등록 권한이 없습니다.
                    </h3>
                </div>
            )}
            
            {/* 탭 버튼 영역 */}
            {roleLevel === 3 ? (
                <>
                    <div style={{ display: "flex", marginBottom: "0px", borderBottom: "2px solid #ddd" }}>
                        <button
                            onClick={() => setActiveTab('employee')}
                            style={{
                                padding: "10px 15px",
                                border: "1px solid #ddd",
                                borderBottom: activeTab === 'employee' ? 'none' : '1px solid #ddd',
                                borderRadius: "5px 5px 0 0",
                                cursor: "pointer",
                                fontWeight: "bold",
                                zIndex: activeTab === 'employee' ? 1 : 0,
                                transform: activeTab === 'employee' ? 'translateY(1px)' : 'translateY(0)',
                                ...(activeTab === 'employee' ? activeTabStyle : inactiveTabStyle),
                                borderRight: 'none',
                            }}
                        >
                            직원 관리
                        </button>
                        <button
                            onClick={() => setActiveTab('store')}
                            style={{
                                padding: "10px 15px",
                                border: "1px solid #ddd",
                                borderLeft: "none",
                                borderBottom: activeTab === 'store' ? 'none' : '1px solid #ddd',
                                borderRadius: "5px 5px 0 0",
                                cursor: "pointer",
                                fontWeight: "bold",
                                zIndex: activeTab === 'store' ? 1 : 0,
                                transform: activeTab === 'store' ? 'translateY(1px)' : 'translateY(0)',
                                ...(activeTab === 'store' ? activeTabStyle : inactiveTabStyle),
                            }}
                        >
                            매장 관리
                        </button>
                    </div>

                    {/* 탭 내용 영역 */}
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "0 10px 10px 10px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            borderTop: "none",
                            marginTop: "-1px"
                        }}
                    >
                        {activeTab === 'employee' && (
                            <EmployeePage 
                                list={list} 
                                setList={setList} 
                                allStores={allStores} 
                                roleLevel={roleLevel}
                                getStoreName={getStoreName}
                            />
                        )}
                        {activeTab === 'store' && <StorePage />}
                    </div>
                </>
            ) : (
                // roleLevel이 1 또는 2일 때: 탭 없이 직원 목록만 표시
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        borderTop: "1px solid #ddd",
                        marginTop: "0px"
                    }}
                >
                    <EmployeePage 
                        list={list} 
                        setList={setList} 
                        allStores={allStores} 
                        roleLevel={roleLevel}
                        getStoreName={getStoreName}
                    />
                </div>
            )}
        </>
    );
}