import EmployeePage from "./EmployeePage";
import PasswordToggle from "../../components/PasswordToggle";
import StorePage from "./StorePage";
import useOperationManagement from "../hook/useOperationManagement";

export default function OperationMobileLayout(props: ReturnType<typeof useOperationManagement>) {
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

    return (
        <div className="p-4">
            {/* 직원 등록 폼 */}
            {roleLevel !== 1 ? (
                <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                    <h3 className="text-lg font-bold mb-3">직원 등록</h3>

                    <div className="flex flex-col gap-2">
                        <input
                            name="id"
                            value={form.id}
                            onChange={(e) => setFormValue("id", e.target.value)}
                            placeholder="ID (필수)"
                            className="border h-10 rounded-md p-2"
                        />
                        <button
                            onClick={handleIdCheck}
                            className={`h-10 px-3 rounded-md text-black ${isIdChecked ? "bg-green-600" : "bg-orange-500"}`}
                        >
                            {isIdChecked ? "✓ 사용 가능" : "중복확인"}
                        </button>

                        <PasswordToggle
                            password={form.pw}
                            setPassword={(v) => setFormValue("pw", v)}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            handleKeyPress={handlePasswordKeyPress}
                        />

                        <PasswordToggle
                            password={form.pwCheck}
                            setPassword={(v) => setFormValue("pwCheck", v)}
                            showPassword={showPasswordCheck}
                            setShowPassword={setShowPasswordCheck}
                            handleKeyPress={handlePasswordKeyPress}
                        />
                        {isPasswordMismatched && (
                            <span className="text-red-500 text-xs mt-1">비밀번호가 다릅니다</span>
                        )}

                        <input
                            name="name"
                            value={form.name}
                            onChange={(e) => setFormValue("name", e.target.value)}
                            placeholder="이름 (필수)"
                            className="border h-10 rounded-md p-2"
                        />
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={(e) => setFormValue("phone", e.target.value)}
                            placeholder="연락처"
                            className="border h-10 rounded-md p-2"
                        />
                        <input
                            name="email"
                            value={form.email}
                            onChange={(e) => setFormValue("email", e.target.value)}
                            placeholder="email@gmail.com (필수)"
                            className="border h-10 rounded-md p-2"
                        />

                        <select
                            name="storeId"
                            value={form.storeId}
                            onChange={(e) => setFormValue("storeId", Number(e.target.value))}
                            className="border h-10 rounded-md p-2"
                        >
                            <option value={0}>매장 선택 (필수)</option>
                            {allStores.map((s) => (
                                <option key={s.storeId} value={s.storeId}>{s.shopName}</option>
                            ))}
                        </select>

                        <select
                            name="role"
                            value={form.role}
                            onChange={(e) => setFormValue("role", e.target.value)}
                            className="border h-10 rounded-md p-2"
                        >
                            <option value="MANAGER">매장 담당자</option>
                            <option value="USER">직원</option>
                        </select>

                        <button
                            onClick={handleRegister}
                            disabled={!isRegisterButtonEnabled}
                            className={`h-10 w-full rounded-md text-black ${isRegisterButtonEnabled ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}
                        >
                            등록
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-md mb-6 text-center text-orange-500 font-bold">
                    직원 등록 권한이 없습니다.
                </div>
            )}

            {/* 탭 영역 (직원 / 매장) */}
            {roleLevel === 3 && (
                <>
                    <div className="flex border-b-2 border-gray-200 mb-4">
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
                    <div className="bg-white p-4 rounded-b-xl shadow-md">
                        {activeTab === "employee" ? (
                            <EmployeePage
                                list={list}
                                setList={setList}
                                allStores={allStores}
                                roleLevel={roleLevel}
                                getStoreName={getStoreName}
                            />
                        ) : (
                            <StorePage />
                        )}
                    </div>
                </>
            )}

            {/* roleLevel !== 3 인 경우 직원 목록만 */}
            {roleLevel !== 3 && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <EmployeePage
                        list={list}
                        setList={setList}
                        allStores={allStores}
                        roleLevel={roleLevel}
                        getStoreName={getStoreName}
                    />
                </div>
            )}
        </div>
    );
}