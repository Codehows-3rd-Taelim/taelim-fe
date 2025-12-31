import EmployeePage from "./EmployeePage";
import StorePage from "./StorePage";
import useOperationManagement from "../hook/useOperationManagement";

// EmployeePage.tsx도 다음과 같이 수정하세요:
// 최상위 div를 다음으로 변경:
// <div className="flex flex-col w-full h-full px-6 py-4 overflow-y-auto bg-gray-100">

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
    <div className="w-full  h-full flex justify-center bg-gray-100">
      <div className="w-full max-w-[1400px] flex flex-col px-4 pt-2 pb-0">
        {/* 관리자(roleLevel === 3)만 탭 표시 */}
        {roleLevel === 3 && (
          <>
            <div className="flex  px-4 pt-6  bg-gray-100 border-b-2 border-gray-400 sm:px-6">
              <button
                onClick={() => setActiveTab("employee")}
                className={`px-4 py-3 font-bold transition-colors text-sm sm:text-base ${
                  activeTab === "employee"
                    ? "bg-orange-500 text-white border-b-4 border-orange-600"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-300"
                }`}
                style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
              >
                직원 관리
              </button>
              <button
                onClick={() => setActiveTab("store")}
                className={`px-4 py-3 font-bold transition-colors text-sm sm:text-base ${
                  activeTab === "store"
                    ? "bg-orange-500 text-white border-b-4 border-orange-600"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-300"
                }`}
                style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
              >
                매장 관리
              </button>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="flex-1 border border-gray-300 border-t-0 p-4 bg-white overflow-auto min-h-[400px]">
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
    </div>
  );
}
