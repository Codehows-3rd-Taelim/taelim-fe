import EmployeePage from "./EmployeePage";
import StorePage from "./StorePage";
import useOperationManagement from "../hook/useOperationManagement";

// EmployeePage.tsx도 다음과 같이 수정하세요:
// 최상위 div를 다음으로 변경:
// <div className="w-full h-full flex flex-col px-6 py-4 bg-gray-100 overflow-y-auto">

export default function OperationDesktopLayout(
  props: ReturnType<typeof useOperationManagement>
) {
  const {
    form,
    setFormValue,
    isIdChecked,
    setIsIdChecked,
    handleIdCheck,
    isPasswordMismatched,
    showPassword,
    setShowPassword,
    showPasswordCheck,
    setShowPasswordCheck,
    isRegisterButtonEnabled,
    handleRegister,
    allStores,
    roleLevel,
    activeTab,
    setActiveTab,
    list,
    setList,
    getStoreName,
    handlePasswordKeyPress,
  } = props;

  return (
    <div className="w-full h-full flex flex-col">
      {/* 관리자(roleLevel === 3)만 탭 표시 */}
      {roleLevel === 3 && (
        <>
          <div className="flex border-b-2 border-gray-400 bg-white px-4 pt-6 sm:px-6 flex-shrink-0">
            <button
              onClick={() => setActiveTab("employee")}
              className={`px-4 py-3 font-bold transition-colors text-sm sm:text-base ${
                activeTab === "employee"
                  ? "bg-orange-500 text-white border-b-4 border-orange-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              직원 관리
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`px-4 py-3 font-bold transition-colors text-sm sm:text-base ${
                activeTab === "store"
                  ? "bg-orange-500 text-white border-b-4 border-orange-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              매장 관리
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="w-full flex-1 min-h-0 flex flex-col">
            {activeTab === "employee" ? (
              <EmployeePage
                list={list}
                setList={setList}
                allStores={allStores}
                roleLevel={roleLevel}
                getStoreName={getStoreName}
                form={form}
                setFormValue={setFormValue}
                isIdChecked={isIdChecked}
                setIsIdChecked={setIsIdChecked}
                handleIdCheck={handleIdCheck}
                isPasswordMismatched={isPasswordMismatched}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showPasswordCheck={showPasswordCheck}
                setShowPasswordCheck={setShowPasswordCheck}
                isRegisterButtonEnabled={isRegisterButtonEnabled}
                handleRegister={handleRegister}
                handlePasswordKeyPress={handlePasswordKeyPress}
                isMobileLayout={false}
              />
            ) : (
              <StorePage />
            )}
          </div>
        </>
      )}

      {/* 일반 직원(roleLevel !== 3)은 직원 페이지만 표시 */}
      {roleLevel !== 3 && (
        <div className="flex-1 min-h-0">
          <EmployeePage
            list={list}
            setList={setList}
            allStores={allStores}
            roleLevel={roleLevel}
            getStoreName={getStoreName}
            form={form}
            setFormValue={setFormValue}
            isIdChecked={isIdChecked}
            setIsIdChecked={setIsIdChecked}
            handleIdCheck={handleIdCheck}
            isPasswordMismatched={isPasswordMismatched}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showPasswordCheck={showPasswordCheck}
            setShowPasswordCheck={setShowPasswordCheck}
            isRegisterButtonEnabled={isRegisterButtonEnabled}
            handleRegister={handleRegister}
            handlePasswordKeyPress={handlePasswordKeyPress}
            isMobileLayout={false}
          />
        </div>
      )}
    </div>
  );
}
