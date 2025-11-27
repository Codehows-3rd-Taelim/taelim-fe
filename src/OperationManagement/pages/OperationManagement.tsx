import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeePage from "./EmployeePage"; 
import type { User, Store, ApiFormUser } from "../../type";
import { checkDuplicateId, getStores, registerEmployee } from "../api/EmployeeApi"; 

// 입력 필드 높이 변수
const INPUT_HEIGHT = "50px";

type LocalUserForm = ApiFormUser & {
    pwCheck: string; // 비밀번호 확인 필드
};

// 임시 StorePage 컴포넌트
const StorePage = () => <div style={{ padding: '20px', border: '1px solid #ddd' }}>매장 목록 영역 (StorePage.tsx)</div>; 

export default function OperationManagement() {
  const navigate = useNavigate();
  
  // 현재 활성화된 탭 상태 ('employee' 또는 'store')
  const [activeTab, setActiveTab] = useState<'employee' | 'store'>('employee');

  // 토큰에서 권한 정보 가져오기 (roleLevel: 0=ADMIN, 1=MANAGER, 2=USER)
  const rawRoleLevel = localStorage.getItem("roleLevel");
  const roleLevel: number = rawRoleLevel ? Number(rawRoleLevel) : -1;

  const rawStoreId = localStorage.getItem("storeId");
  const userStoreId: number = rawStoreId ? Number(rawStoreId) : 0;

  // API를 통해 가져올 매장 목록 상태
  const [allStores, setAllStores] = useState<Store[]>([]);

  // 데이터 로딩 상태
  const [loadingStores, setLoadingStores] = useState(true);

  // 매장 목록을 API를 통해 가져오는 useEffect
  useEffect(() => {
    const loadStores = async () => {
        try {
            let storeIdToFetch;

            console.log("roleLevel:", roleLevel);

            // 💡 ADMIN(3)이면 undefined를 전달하여 모든 매장 조회를 요청합니다.
            if (roleLevel === 3) {
                storeIdToFetch = undefined;
            } 
            // 💡 MANAGER(1)나 USER(2)이고 유효한 storeId가 있으면 해당 storeId를 전달합니다.
            else {
                storeIdToFetch = userStoreId;
            }
            
            console.log("storeIdToFetch:", storeIdToFetch);
            
            // 💡 getStores 함수를 사용하도록 수정
            const data = await getStores(storeIdToFetch); 
            let storesToShow = data;

            // roleLevel이 3이 아닐 경우 (MANAGER: 2 또는 USER: 1)
            // API가 모든 매장을 반환하더라도, 자신의 storeId로만 필터링합니다.
            if (roleLevel !== 3 && userStoreId) {
            storesToShow = data.filter(store => store.storeId === userStoreId);
            }

            setAllStores(storesToShow);
        } catch (err) {
            console.error(err);
            alert("매장 목록을 가져오는 데 실패했습니다.");
            setAllStores([]); // 실패 시 빈 배열로 초기화
        } finally {
            setLoadingStores(false);
        }
    };
    loadStores();
  }, [roleLevel, userStoreId]); // 권한 레벨이나 사용자 storeId가 변경되면 다시 호출

  // 폼 상태 - User 타입 기반
  const getInitialForm = (): LocalUserForm => ({
    id: "",
    pw: "",
    pwCheck: "", // 로컬 필드
    name: "",
    phone: "",
    email: "",
    role: "USER", // 기본값을 "USER"로 설정 (ADMIN은 등록하지 않음)
    storeId: roleLevel === 2 || roleLevel === 1 ? userStoreId : 3,
  });

  const [form, setForm] = useState<LocalUserForm>(getInitialForm());
    
  // ID 중복 확인 상태 추가
  const [isIdChecked, setIsIdChecked] = useState(false);

  // list 상태를 OperationManagement에서 관리하고 하위 컴포넌트로 전달
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
  const handleIdCheck = async () => {
    if (!form.id.trim()) {
      alert("ID를 입력해주세요.");
      setIsIdChecked(false);
      return;
    }

    try {
      // 실제 API 호출
      const data = await checkDuplicateId(form.id); 
      
      if (data.exists) {
        alert("이미 사용 중인 ID입니다.");
        setIsIdChecked(false); // ❌ 중복된 경우
      } else {
        alert("사용 가능한 ID입니다.");
        setIsIdChecked(true); // ⭕ 사용 가능한 경우
      }
    } catch (err) {
      // EmployeeApi에서 던진 오류 처리
      alert(err instanceof Error ? err.message : "ID 중복 확인 중 알 수 없는 오류가 발생했습니다.");
      setIsIdChecked(false);
    }
  }; // 👈 함수가 여기서 올바르게 닫힙니다.

  // 파생 상태 계산 (렌더링 직전에 계산)
  const isPasswordMismatched = form.pwCheck.length > 0 && form.pw !== form.pwCheck;
  const isPasswordValid = form.pw.length > 0 && form.pw === form.pwCheck;

  // 필수 필드 입력 여부 확인
  const isFormFilled = Boolean(
    form.id && form.pw && form.name && form.email && form.storeId
  );

  // 등록 버튼 활성화 조건
  const isRegisterButtonEnabled = 
    roleLevel !== 1 && // 권한 레벨 1는 등록 불가
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
    // ESLint 설정이 언더바(_)로 시작하는 변수를 무시하도록 설정 ↓
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pwCheck: _pwCheck, ...newUserApiData } = form; // pwCheck 필드 제거

    try {
      // API 함수 호출
      const message = await registerEmployee(newUserApiData);

      alert(message);
      
      // 등록 성공 시 로컬 목록 업데이트 및 폼 초기화
      // (User 타입에 userId가 Optional로 변경되었으므로 임시 userId 할당 로직이 필요 없습니다.)
      const newUser: User = { 
          // userId는 백엔드에서 생성되므로, 임시로 로컬 목록에 추가할 때는 제외하거나 임시 값을 사용해야 하지만,
          // 여기서는 ApiFormUser를 기반으로 생성하고 EmployeePage에서 다시 불러오거나 처리해야 합니다.
          // 현재는 로컬 list를 업데이트하는 용도로만 사용합니다.
          ...newUserApiData,
      };
      // 목록에 추가
      setList([...list, newUser]);

      // 등록 후 상태 및 중복확인 상태 초기화
      setForm(getInitialForm());
      setIsIdChecked(false);
    } catch (err) {
      // EmployeeApi에서 던진 오류 처리
      alert(err instanceof Error ? err.message : "직원 등록 중 알 수 없는 오류가 발생했습니다.");
    }
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

  if (loadingStores) {
      return <div style={{ padding: "30px", textAlign: "center" }}>매장 정보를 불러오는 중입니다...</div>;
  }

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

      {/* 직원 등록 폼 또는 권한 없음 메시지 */}
      {roleLevel !== 1 ? (
        // 3(ADMIN) 또는 2(MANAGER)일 경우 직원 등록 폼 렌더링
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

          {/* 💡 수정된 등록 필드 영역: 가로 5칸으로 배치 (테이블 행처럼 보임) */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            
            {/* 5개 항목을 가로로 배치하기 위한 너비 계산 (gap: 10px 기준) */}
            {/* 100% = 5 * ITEM_WIDTH + 4 * 10px(gap) */}
            {/* ITEM_WIDTH = (100% - 40px) / 5 = 20% - 8px */}
            {/* const ITEM_WIDTH = 'calc(20% - 8px)'; */}
            
            {/* 1. ID */}
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="ID"
              className="input"
              style={{ width: 'calc(20% - 8px)', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />
            
            {/* 2. 중복확인 버튼 */}
            <div style={{width: 'calc(20% - 8px)', textAlign: "center"}}>
                <button 
                onClick={handleIdCheck} 
                style={{ 
                    width: '100px',
                    height: INPUT_HEIGHT,
                    backgroundColor: isIdChecked ? "#7CB342" : "#FF8A00", 
                    color: "white",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                    border: isIdChecked ? 'none' : '1px solid #ddd',
                    // 텍스트를 중간에 오도록 추가된 스타일
                    display: "flex",
                    alignItems: "center", // 세로 중앙 정렬
                    justifyContent: "center", // 가로 중앙 정렬
                }}
                >
                {isIdChecked ? "✓ 사용 가능" : "중복확인"}
                </button>
            </div>

              {/* 2. PW */}
              <input
                name="pw"
                value={form.pw}
                onChange={handleChange}
                type="password"
                placeholder="PW"
                className="input"
                style={{ width: 'calc(20% - 8px)', boxSizing: "border-box", height: INPUT_HEIGHT }}
              />
              
            {/* 3. PW 확인 필드 (2번째 줄 - 두 번째 칸) */}
            <div style={{ width: 'calc(20% - 8px)' }}>
              <input
                name="pwCheck"
                value={form.pwCheck}
                onChange={handleChange}
                type="password"
                placeholder="PW 확인"
                className="input"
                style={{ width: "100%", height: INPUT_HEIGHT }}
              />
              {/* 비밀번호 오류 메시지 */}
              {isPasswordMismatched && (
                <div style={{ color: "red", marginTop: "5px", fontSize: "12px" }}>비밀번호가 다릅니다</div>
              )}
            </div>

            {/* 4. 등록 버튼 (2번째 줄 - 다섯 번째 칸) */}
            <div style={{width: 'calc(20% - 8px)',}}>
                <button
                onClick={handleRegister}
                disabled={!isRegisterButtonEnabled} 
                style={{
                    width: '80px',
                    backgroundColor: isRegisterButtonEnabled ? "#FF8A00" : "#ccc", 
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: isRegisterButtonEnabled ? "pointer" : "not-allowed",
                    height: INPUT_HEIGHT, 
                    lineHeight: "24px", 
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                }}
                >
                등록
                </button>
            </div>

            {/* 5. 이름 */}
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름"
              className="input"
              style={{ width: 'calc(20% - 8px)', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />
            
            {/* 6. 연락처 (phone) */}
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="연락처"
              className="input"
              style={{ width: 'calc(20% - 8px)', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />
            
            {/* 7. 이메일 */}
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@gmail.com"
              className="input"
              style={{ width: 'calc(20% - 8px)', boxSizing: "border-box", height: INPUT_HEIGHT }}
            />

            {/* 8. 매장명 (select/readonly input) (2번째 줄 - 세 번째 칸) */}
            <div style={{ width: 'calc(20% - 8px)' }}>
              {roleLevel === 3 ? (
                <select
                  name="storeId"
                  value={form.storeId}
                  onChange={handleChange}
                  className="input"
                  style={{ width: "100%", height: INPUT_HEIGHT, boxSizing: "border-box" }}
                >
                  <option value={0}>매장 선택</option>
                  {allStores.map((s) => (
                    <option key={s.storeId} value={s.storeId}>
                      {s.shopName}
                    </option>
                  ))}
                </select>
              ) : (
                // Manager/User는 자신의 매장만 표시
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
            
            {/* 9. 권한 (select/readonly input) (2번째 줄 - 네 번째 칸) */}
            <div style={{ width: 'calc(20% - 8px)' }}>
              {roleLevel === 3 ? (
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input"
                  style={{ width: "100%", height: INPUT_HEIGHT, boxSizing: "border-box" }}
                >
                  <option value="MANAGER">매장 담당자</option>
                  <option value="USER">직원</option>
                </select>
              ) : (
                // Manager는 USER만 등록 가능, USER는 등록 불가
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
          </div>
        </div>
      ) : (
        // 1(USER)일 경우 "직원 등록 권한이 없습니다." 메시지 렌더링
        <div
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "10px",
            marginBottom: "40px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            textAlign: "center",
            minHeight: "150px", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#FF8A00" }}>
            직원 등록 권한이 없습니다.
          </h3>
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
          />
        )}
        {activeTab === 'store' && <StorePage />}
      </div>
    </div>
  );
}