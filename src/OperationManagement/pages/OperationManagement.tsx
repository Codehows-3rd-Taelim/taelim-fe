// OperationManagement.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// EmployeePage 컴포넌트를 가져옵니다.
import EmployeePage from "./EmployeePage"; 
import type { User, Store } from "../../type";

// 입력 필드 높이 변수
const INPUT_HEIGHT = "50px";

// 임시 StorePage 컴포넌트 (나중에 실제 StorePage.tsx 파일로 대체해야 합니다)
const StorePage = () => <div style={{ padding: '20px', border: '1px solid #ddd' }}>매장 목록 영역 (StorePage.tsx)</div>; 

export default function OperationManagement() {
  const navigate = useNavigate();
  
  // 🟢 현재 활성화된 탭 상태 ('employee' 또는 'store')
  const [activeTab, setActiveTab] = useState<'employee' | 'store'>('employee');

  // 🔥 토큰에서 권한 정보 가져오기 (roleLevel: 0=ADMIN, 1=MANAGER, 2=USER)
  const roleLevel = Number(localStorage.getItem("roleLevel"));
  const userStoreId = Number(localStorage.getItem("storeId"));

  // 🔥 모든 매장목록 (roleLevel=0만 사용)
  const allStores: Store[] = [
    { storeId: 1, shopId: 1, shopName: "대동팝", industryId: 1 },
    { storeId: 2, shopId: 2, shopName: "문정제일병원", industryId: 2 },
    { storeId: 3, shopId: 3, shopName: "청라CC", industryId: 3 },
    { storeId: 4, shopId: 4, shopName: "인니스트리", industryId: 1 },
  ];

  // 폼 상태 - User 타입 기반
  const getInitialForm = (): Omit<User, "userId"> => ({
    id: "",
    pw: "",
    name: "",
    phone: "",
    email: "",
    role: "USER",
    storeId: roleLevel === 1 || roleLevel === 2 ? userStoreId : 0,
  });

  const [form, setForm] = useState<Omit<User, "userId"> & { pwCheck: string }>(
    {
      ...getInitialForm(),
      pwCheck: "",
    }
  );
    
  // 🟢 ID 중복 확인 상태 추가
  const [isIdChecked, setIsIdChecked] = useState(false);

  // 직원 목록 상태는 EmployeePage로 이동하나, 등록 로직을 위해 임시로 유지하거나 API 호출로 대체해야 합니다. 
  // (현재는 EmployeePage로 list와 setList를 전달하여 상태를 공유하도록 변경했습니다.)
  
  // 🔥 list 상태를 OperationManagement에서 관리하고 하위 컴포넌트로 전달 (등록 기능 유지를 위해)
  const [list, setList] = useState<User[]>([
    { userId: 1, id: "store1", pw: "pw1", name: "나사장", phone: "010-1010-1010", email: "store1@gmail.com", role: "MANAGER", storeId: 1 },
    { userId: 2, id: "user1", pw: "pw2", name: "김직원", phone: "010-1111-1111", email: "user1@gmail.com", role: "USER", storeId: 1 },
    { userId: 3, id: "user2", pw: "pw3", name: "이직원", phone: "010-2222-2222", email: "user2@gmail.com", role: "USER", storeId: 2 },
    { userId: 4, id: "user3", pw: "pw4", name: "박직원", phone: "010-3333-3333", email: "user3@gmail.com", role: "USER", storeId: 2 },
  ]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // ID 변경 시 중복 확인 상태 초기화
    if (name === "id") {
      setIsIdChecked(false);
    }

    if (name === "storeId") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✔ ID 중복확인
  const handleIdCheck = () => {
    if (!form.id) {
      alert("ID를 입력해주세요.");
      setIsIdChecked(false);
      return;
    }

    const exists = list.some((user) => user.id === form.id);
    
    if (exists) {
      alert("이미 사용 중인 ID입니다.");
      setIsIdChecked(false); // ❌ 중복된 경우
    } else {
      alert("사용 가능한 ID입니다.");
      setIsIdChecked(true); // ⭕ 사용 가능한 경우
    }
  };

  // 🟢 파생 상태 계산 (렌더링 직전에 계산)
  const isPasswordMismatched = form.pwCheck.length > 0 && form.pw !== form.pwCheck;
  const isPasswordValid = form.pw.length > 0 && form.pw === form.pwCheck;

  // 🟢 필수 필드 입력 여부 확인
  const isFormFilled = Boolean(
    form.id && form.pw && form.name && form.email && form.storeId
  );

  // 🟢 등록 버튼 활성화 조건
  const isRegisterButtonEnabled = 
    roleLevel !== 2 && // 권한 레벨 2는 등록 불가
    isIdChecked && // ID 중복 확인 완료
    isPasswordValid && // 비밀번호 유효성 검사 (일치) 완료
    isFormFilled; // 필수 필드 모두 입력

  // ✔ 직원 등록
  const handleRegister = () => {
    if (roleLevel === 2) return; // 조회만 가능

    // 등록 버튼이 비활성화된 상태에서 버튼을 누르는 경우를 대비한 최종 체크
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

    const newUser: User = {
      userId: Math.max(...list.map((u) => u.userId || 0), 0) + 1,
      id: form.id,
      pw: form.pw,
      name: form.name,
      phone: form.phone,
      email: form.email,
      role: form.role,
      storeId: form.storeId,
    };

    setList([...list, newUser]);
    
    // 등록 후 상태 및 중복확인 상태 초기화
    setForm({ ...getInitialForm(), pwCheck: "" });
    setIsIdChecked(false);
  };

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

  const activeTabStyle: React.CSSProperties = {
    backgroundColor: "#FF8A00",
    color: "white",
    borderBottom: "none",
  };

  const inactiveTabStyle: React.CSSProperties = {
    backgroundColor: "#f0f0f0",
    color: "#333",
  };

  return (
    <div style={{ padding: "0px" }}>
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

      {/* 직원 등록 폼 */}
      {roleLevel !== 2 && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "10px",
            marginBottom: "40px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
            직원 등록
          </h3>

          {/* 등록 필드 영역 */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            
            {/* ID 필드 및 중복확인 버튼 영역 */}
            <div style={{ flexGrow: 1, minWidth: "150px" }}>
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="ID"
                className="input"
                style={{ width: "100%", boxSizing: "border-box", height: INPUT_HEIGHT }}
              />
              {/* 중복확인 버튼 */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <button 
                  onClick={handleIdCheck} 
                  style={{ 
                    padding: "5px 10px", 
                    height: INPUT_HEIGHT,
                    backgroundColor: isIdChecked ? "#7CB342" : undefined, 
                    color: isIdChecked ? "white" : undefined,
                    whiteSpace: "nowrap"
                  }}
                >
                  {isIdChecked ? "✓" : "중복확인"}
                </button>
              </div>
            </div>
            
            {/* PW 필드 및 PW 확인 필드 영역 */}
            <div style={{ flexGrow: 1, minWidth: "150px" }}>
              <input
                name="pw"
                value={form.pw}
                onChange={handleChange}
                type="password"
                placeholder="PW"
                className="input"
                style={{ width: "100%", boxSizing: "border-box", height: INPUT_HEIGHT }}
              />
              {/* PW 확인 필드 */}
              <div style={{ display: "flex", marginTop: "10px" }}>
                <input
                  name="pwCheck"
                  value={form.pwCheck}
                  onChange={handleChange}
                  type="password"
                  placeholder="PW 확인"
                  className="input"
                  style={{ flexGrow: 1, height: INPUT_HEIGHT }}
                />
              </div>
              
              {/* 🟢 비밀번호 오류 메시지 (PW 확인 입력칸 아래에 위치) */}
              {isPasswordMismatched && (
                <div style={{ color: "red", marginTop: "5px", fontSize: "12px" }}>비밀번호가 다릅니다</div>
              )}
            </div>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름"
              className="input"
              style={{ flexGrow: 1, height: INPUT_HEIGHT }}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="전화번호"
              className="input"
              style={{ flexGrow: 1, height: INPUT_HEIGHT }}
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@gmail.com"
              className="input"
              style={{ flexGrow: 1, height: INPUT_HEIGHT }}
            />

            {/* 매장명 (select) - INPUT_HEIGHT 적용 */}
            {roleLevel === 0 ? (
              <select
                name="storeId"
                value={form.storeId}
                onChange={handleChange}
                className="input"
                style={{ flexGrow: 1, height: INPUT_HEIGHT, boxSizing: "border-box" }}
              >
                <option value={0}>매장 선택</option>
                {allStores.map((s) => (
                  <option key={s.storeId} value={s.storeId}>
                    {s.shopName}
                  </option>
                ))}
              </select>
            ) : (
              // 매장명 (readonly input) - INPUT_HEIGHT 적용
              <input
                value={getStoreName(form.storeId)}
                readOnly
                disabled
                // padding을 유지하고 height를 명시하여 최종 높이 통일
                style={{ background: "#eee", padding: "8px", flexGrow: 1, height: INPUT_HEIGHT, boxSizing: "border-box" }}
              />
            )}

            {/* 권한 (select) - INPUT_HEIGHT 적용 */}
            {roleLevel === 0 ? (
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input"
                style={{ flexGrow: 1, height: INPUT_HEIGHT, boxSizing: "border-box" }}
              >
                <option value="MANAGER">매장 담당자</option>
                <option value="USER">직원</option>
              </select>
            ) : roleLevel === 1 ? (
              // 권한 (readonly input) - INPUT_HEIGHT 적용
              <input
                value="직원"
                readOnly
                disabled
                style={{ background: "#eee", padding: "8px", flexGrow: 1, height: INPUT_HEIGHT, boxSizing: "border-box" }}
              />
            ) : (
              // 권한 (readonly input) - INPUT_HEIGHT 적용
              <input
                value={form.role}
                readOnly
                disabled
                style={{ background: "#eee", padding: "8px", flexGrow: 1, height: INPUT_HEIGHT, boxSizing: "border-box" }}
              />
            )}

            {/* 등록 버튼 - INPUT_HEIGHT 적용 */}
            <button
              onClick={handleRegister}
              disabled={!isRegisterButtonEnabled} 
              style={{
                backgroundColor: isRegisterButtonEnabled ? "#FF8A00" : "#ccc", 
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: isRegisterButtonEnabled ? "pointer" : "not-allowed",
                height: INPUT_HEIGHT, 
                lineHeight: "24px", 
                whiteSpace: "nowrap",
              }}
            >
              등록
            </button>
          </div>
        </div>
      )}
      
      {/* 탭 버튼 영역 */}
      <div style={{ display: "flex", marginBottom: "0px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab('employee')}
          style={{
            padding: "10px 20px",
            border: "1px solid #ddd",
            borderBottom: activeTab === 'employee' ? 'none' : '1px solid #ddd',
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold",
            zIndex: activeTab === 'employee' ? 1 : 0,
            transform: activeTab === 'employee' ? 'translateY(1px)' : 'translateY(0)',
            ...(activeTab === 'employee' ? activeTabStyle : inactiveTabStyle),
          }}
        >
          직원 관리
        </button>
        <button
          onClick={() => setActiveTab('store')}
          style={{
            padding: "10px 20px",
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
          padding: "30px",
          borderRadius: "0 10px 10px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderTop: "none", // 탭 버튼과 연결되도록 상단 보더 제거
          marginTop: "-1px" // 탭 버튼 아래로 살짝 올리기
        }}
      >
        {activeTab === 'employee' && (
          <EmployeePage 
            list={list} 
            setList={setList} 
            allStores={allStores} 
            roleLevel={roleLevel}
          />
        )}
        {activeTab === 'store' && <StorePage />}
      </div>
    </div>
  );
}