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
        list, setList, getStoreName, handlePasswordKeyPress
    } = props;

    const loggedInStoreId = form.storeId;

    const filteredStores = roleLevel === 3 
        ? allStores 
        : allStores.filter(s => s.storeId === loggedInStoreId);

    const roleOptions = roleLevel === 3 
        ? [
            { value: "MANAGER", label: "매장 담당자" },
            { value: "USER", label: "직원" }
          ] 
        : [
            { value: "USER", label: "직원" }
          ];
    
    if (roleLevel === 2) {
        if (allStores.length > 0 && form.storeId !== allStores.find(s => s.storeId === loggedInStoreId)?.storeId) {
            setFormValue("storeId", allStores.find(s => s.storeId === loggedInStoreId)?.storeId || 0);
        }
        if (form.role !== 'USER') {
             setFormValue("role", "USER");
        }
    }

    return (
        <div className="p-6">
            {/* 직원 등록 폼 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-10">
                <h3 className="text-lg font-bold mb-5">직원 등록</h3>
                <div className="relative">
                    {/* 입력 칸들 (너비 유지용) */}
                    <div className={`flex flex-wrap gap-2 mb-4 items-start ${roleLevel === 1 ? 'invisible' : ''}`}>
                        <input
                            name="id"
                            value={form.id}
                            onChange={(e) => setFormValue("id", e.target.value)}
                            placeholder="ID"
                            className="border h-12 rounded-md p-2 flex-1 min-w-[80px]"
                            tabIndex={roleLevel === 1 ? -1 : 1}
                            disabled={roleLevel === 1}
                        />
                        <button
                            onClick={handleIdCheck}
                            className={`h-12 px-3 rounded-md text-black whitespace-nowrap flex-shrink-0 ${isIdChecked ? "bg-green-600" : "bg-orange-500"}`}
                            tabIndex={roleLevel === 1 ? -1 : 2}
                            disabled={roleLevel === 1}
                        >
                            {isIdChecked ? "확인" : "중복"}
                        </button>
                        
                        <div className="flex-1 min-w-[120px]">
                            <PasswordToggle
                                password={form.pw}
                                setPassword={(v) => setFormValue("pw", v)}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                handleKeyPress={handlePasswordKeyPress}
                                tabIndex={roleLevel === 1 ? -1 : 3}
                                placeholder="비밀번호"
                            />
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <PasswordToggle
                                password={form.pwCheck}
                                setPassword={(v) => setFormValue("pwCheck", v)}
                                showPassword={showPasswordCheck}
                                setShowPassword={setShowPasswordCheck}
                                handleKeyPress={handlePasswordKeyPress}
                                tabIndex={roleLevel === 1 ? -1 : 4}
                                placeholder="비번확인"
                            />
                            {isPasswordMismatched && roleLevel !== 1 && (
                                <span className="text-red-500 text-xs mt-1 absolute">비밀번호 불일치</span>
                            )}
                        </div>
                        
                        <input
                            name="name"
                            value={form.name}
                            onChange={(e) => setFormValue("name", e.target.value)}
                            placeholder="이름"
                            className="border h-12 rounded-md p-2 flex-1 min-w-[70px]"
                            tabIndex={roleLevel === 1 ? -1 : 5}
                            disabled={roleLevel === 1}
                        />
                        
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={(e) => setFormValue("phone", e.target.value)}
                            placeholder="연락처"
                            className="border h-12 rounded-md p-2 flex-1 min-w-[110px]"
                            tabIndex={roleLevel === 1 ? -1 : 6}
                            disabled={roleLevel === 1}
                        />
                        
                        <input
                            name="email"
                            value={form.email}
                            onChange={(e) => setFormValue("email", e.target.value)}
                            placeholder="이메일"
                            className="border h-12 rounded-md p-2 flex-[1.5] min-w-[150px]"
                            tabIndex={roleLevel === 1 ? -1 : 7}
                            disabled={roleLevel === 1}
                        />
                        
                        <select
                            name="storeId"
                            value={form.storeId}
                            onChange={(e) => setFormValue("storeId", Number(e.target.value))}
                            className="border h-12 rounded-md p-2 flex-1 min-w-[100px]"
                            tabIndex={roleLevel === 1 ? -1 : 8}
                            disabled={roleLevel === 1 || roleLevel === 2}
                        >
                            <option value={0} disabled={roleLevel === 2}>
                                {roleLevel === 2 ? getStoreName(loggedInStoreId) : "매장선택"}
                            </option>
                            
                            {roleLevel === 3 && allStores.map((s) => (
                                <option key={s.storeId} value={s.storeId}>{s.shopName}</option>
                            ))}
                            {roleLevel === 2 && filteredStores.map((s) => (
                                <option key={s.storeId} value={s.storeId}>{s.shopName}</option>
                            ))}
                        </select>
                        
                        <select
                            name="role"
                            value={form.role}
                            onChange={(e) => setFormValue("role", e.target.value)}
                            className="border h-12 rounded-md p-2 flex-1 min-w-[90px]"
                            tabIndex={roleLevel === 1 ? -1 : 9}
                            disabled={roleLevel === 1 || roleLevel === 2}
                        >
                            {roleLevel === 3 ? (
                                <>
                                    {roleOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </>
                            ) : (
                                <option value="USER">직원</option>
                            )}
                        </select>

                        <button
                            onClick={handleRegister}
                            disabled={roleLevel === 1 || !isRegisterButtonEnabled}
                            className={`h-12 px-4 rounded-md text-black whitespace-nowrap flex-shrink-0 ${isRegisterButtonEnabled && roleLevel !== 1 ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}
                            tabIndex={roleLevel === 1 ? -1 : 10}
                        >
                            등록
                        </button>
                    </div>

                    {/* 권한 없음 메시지 (roleLevel 1일 때만 표시) */}
                    {roleLevel === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white px-8 py-4 text-center text-orange-500 font-bold text-lg">
                                직원 등록 권한이 없습니다.
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <hr className="my-6" />

            {/* 탭 영역 (직원/매장 관리) */}
            <div className="mb-4">
                {roleLevel === 3 && (
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

                {roleLevel !== 3 && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <EmployeePage list={list} setList={setList} allStores={allStores} roleLevel={roleLevel} getStoreName={getStoreName} />
                    </div>
                )}
            </div>
        </div>
    );
}