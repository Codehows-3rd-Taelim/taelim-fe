import EmployeePage from "./EmployeePage";
import PasswordToggle from "../../components/PasswordToggle";
import StorePage from "./StorePage";
import useOperationManagement from "../hook/useOperationManagement";

export default function OperationDesktopLayout(props: ReturnType<typeof useOperationManagement>) {
    const {
        form, setFormValue,
        isIdChecked, handleIdCheck,
        isPasswordMismatched,
        showPassword, setShowPassword,
        showPasswordCheck, setShowPasswordCheck,
        isRegisterButtonEnabled, handleRegister,
        allStores, roleLevel, activeTab, setActiveTab,
        list, setList, getStoreName,
        handlePasswordKeyPress, handleLogout
    } = props;

    // 현재 로그인된 사용자의 매장 ID (매장 담당자일 경우 사용)
    // 이 값은 useOperationManagement 훅이나 props에서 제공되어야 하지만, 
    // 현재 props에 없으므로 임의로 첫 번째 매장을 사용하거나, 
    // 실제 hook에서 가져온다고 가정하고, 일단 form.storeId를 사용합니다.
    const loggedInStoreId = form.storeId; // 실제로는 로그인 정보를 통해 가져와야 함

    // roleLevel이 2(매장 담당자)일 때, 매장 선택 필드에 표시/고정될 매장 목록
    const filteredStores = roleLevel === 3 
        ? allStores 
        : allStores.filter(s => s.storeId === loggedInStoreId);

    // roleLevel이 2(매장 담당자)일 때, 권한 필드에 표시될 옵션 (USER로 고정)
    const roleOptions = roleLevel === 3 
        ? [
            { value: "MANAGER", label: "매장 담당자" },
            { value: "USER", label: "직원" }
          ] 
        : [
            { value: "USER", label: "직원" } // 매장 담당자는 직원만 등록 가능
          ];
    
    // 매장 담당자(2)의 경우, 매장과 권한을 고정합니다.
    if (roleLevel === 2) {
        // 본인 매장으로 고정 (allStores에서 첫 번째 매장을 찾거나, form.storeId를 사용)
        if (allStores.length > 0 && form.storeId !== allStores.find(s => s.storeId === loggedInStoreId)?.storeId) {
            setFormValue("storeId", allStores.find(s => s.storeId === loggedInStoreId)?.storeId || 0);
        }
        // 권한을 USER로 고정
        if (form.role !== 'USER') {
             setFormValue("role", "USER");
        }
    }

    return (
        <div className="p-6">
            {/* 로그아웃 버튼 */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleLogout}
                    className="bg-orange-500 text-black px-4 py-2 rounded-md hover:bg-orange-600"
                >
                    로그아웃
                </button>
            </div>

            {/* 직원 등록 폼 */}
            {roleLevel !== 1 ? (
                <div className="bg-white p-6 rounded-xl shadow-md mb-10">
                    <h3 className="text-lg font-bold mb-5">직원 등록</h3>

                    {/* 첫 번째 행: ID + 중복확인 + PW + PW 확인 + 등록 버튼 */}
                    <div className="flex gap-2 mb-4">
                        <input
                            name="id"
                            value={form.id}
                            onChange={(e) => setFormValue("id", e.target.value)}
                            placeholder="ID (필수)"
                            className="border h-12 rounded-md p-2 w-50" // 너비 조정
                            tabIndex={1}
                        />
                        <button
                            onClick={handleIdCheck}
                            className={`h-12 px-4 rounded-md text-black w-30 ${isIdChecked ? "bg-green-600" : "bg-orange-500"}`}
                            tabIndex={2}
                        >
                            {isIdChecked ? "사용가능" : "중복확인"}
                        </button>
                        
                        <div className="flex-1">
                            <PasswordToggle
                                password={form.pw}
                                setPassword={(v) => setFormValue("pw", v)}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                handleKeyPress={handlePasswordKeyPress}
                                tabIndex={3}
                                placeholder="비밀번호 (8자 이상)"
                            />
                        </div>
                        
                        <div className="flex flex-col flex-1">
                            <PasswordToggle
                                password={form.pwCheck}
                                setPassword={(v) => setFormValue("pwCheck", v)}
                                showPassword={showPasswordCheck}
                                setShowPassword={setShowPasswordCheck}
                                handleKeyPress={handlePasswordKeyPress}
                                tabIndex={4}
                                placeholder="비밀번호 재확인"
                            />
                            {isPasswordMismatched && (
                                <span className="text-red-500 text-xs mt-1">비밀번호가 다릅니다</span>
                            )}
                        </div>

                        {/* 등록 버튼을 첫 번째 행 끝에 배치 */}
                        <button
                            onClick={handleRegister}
                            disabled={!isRegisterButtonEnabled}
                            className={`h-12 w-20 rounded-md text-black ${isRegisterButtonEnabled ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}
                            tabIndex={10}
                        >
                            등록
                        </button>
                    </div>

                    {/* 두 번째 행: 이름 + 연락처 + 이메일 */}
                    <div className="flex gap-2 mb-4">
                        <input
                            name="name"
                            value={form.name}
                            onChange={(e) => setFormValue("name", e.target.value)}
                            placeholder="이름 (필수)"
                            className="border h-12 rounded-md p-2 w-35"
                            tabIndex={5}
                        />
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={(e) => setFormValue("phone", e.target.value)}
                            placeholder="연락처 ( '-' 포함 13자리)"
                            className="border h-12 rounded-md p-2 flex-1"
                            tabIndex={6}
                        />
                        <input
                            name="email"
                            value={form.email}
                            onChange={(e) => setFormValue("email", e.target.value)}
                            placeholder="email@gmail.com (필수)"
                            className="border h-12 rounded-md p-2 w-55"
                            tabIndex={7}
                        />
                        {/* 매장 선택 (roleLevel에 따라 disabled/option 변경) */}
                        <select
                            name="storeId"
                            value={form.storeId}
                            onChange={(e) => setFormValue("storeId", Number(e.target.value))}
                            className="border h-12 rounded-md p-2 w-45"
                            tabIndex={8}
                            disabled={roleLevel === 2} // 매장 담당자(2)일 경우 선택 불가
                        >
                            <option value={0} disabled={roleLevel === 2}>
                                {roleLevel === 2 ? getStoreName(loggedInStoreId) : "매장 선택 (필수)"}
                            </option>
                            
                            {roleLevel === 3 && allStores.map((s) => ( // 관리자(3)만 모든 매장 표시
                                <option key={s.storeId} value={s.storeId}>{s.shopName}</option>
                            ))}
                            {roleLevel === 2 && filteredStores.map((s) => ( // 매장 담당자(2)는 본인 매장만 고정 표시
                                <option key={s.storeId} value={s.storeId}>{s.shopName}</option>
                            ))}
                        </select>
                        
                        {/* 권한 선택 (roleLevel에 따라 disabled/option 변경) */}
                        <select
                            name="role"
                            value={form.role}
                            onChange={(e) => setFormValue("role", e.target.value)}
                            className="border h-12 rounded-md p-2 w-35"
                            tabIndex={9}
                            disabled={roleLevel === 2} // 매장 담당자(2)일 경우 선택 불가
                        >
                            {roleLevel === 3 ? (
                                <>
                                    {/* 관리자는 두 옵션 모두 선택 가능하며, MANAGER가 디폴트*/}
                                    {roleOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </>
                            ) : (
                                // 매장 담당자(2)는 직원만 표시 (USER로 고정)
                                <option value="USER">직원</option>
                            )}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-md mb-10 text-center text-orange-500 font-bold">
                    직원 등록 권한이 없습니다.
                </div>
            )}
            
            <hr className="my-6" />

            {/* 탭 영역 (직원/매장 관리) */}
            <div className="mb-4">
                {roleLevel === 3 && ( // 관리자만 탭 표시
                    <>
                        <div className="flex border-b-2 border-gray-200">
                            <button
                                onClick={() => setActiveTab("employee")}
                                className={`px-4 py-2 rounded-t-md font-bold ${activeTab === "employee" ? "bg-orange-500 text-black" : "bg-gray-200 text-gray-700"}`}
                            >
                                직원 관리
                            </button>
                            <button
                                onClick={() => setActiveTab("store")}
                                className={`px-4 py-2 rounded-t-md font-bold ${activeTab === "store" ? "bg-orange-500 text-black" : "bg-gray-200 text-gray-700"}`}
                            >
                                매장 관리
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-b-xl shadow-md">
                            {activeTab === "employee" ? (
                                <EmployeePage list={list} setList={setList} allStores={allStores} roleLevel={roleLevel} getStoreName={getStoreName} />
                            ) : (
                                <StorePage />
                            )}
                        </div>
                    </>
                )}

                {roleLevel !== 3 && ( // 관리자가 아닌 경우 (매장 담당자/일반 직원)
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <EmployeePage list={list} setList={setList} allStores={allStores} roleLevel={roleLevel} getStoreName={getStoreName} />
                    </div>
                )}
            </div>
        </div>
    );
}