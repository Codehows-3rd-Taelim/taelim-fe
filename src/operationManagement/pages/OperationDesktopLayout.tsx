import EmployeePage from "./EmployeePage";
import StorePage from "./StorePage";
import useOperationManagement from "../hook/useOperationManagement";

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
    <div className="w-full p-6">
      {/* 탭 영역 (직원/매장 관리) */}
      <div className="mb-4">
        {roleLevel === 3 && (
          <>
            <div className="flex border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab("employee")}
                className={`px-4 py-2 rounded-t-md font-bold ${
                  activeTab === "employee"
                    ? "bg-orange-500 text-black"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                직원 관리
              </button>
              <button
                onClick={() => setActiveTab("store")}
                className={`px-4 py-2 rounded-t-md font-bold ${
                  activeTab === "store"
                    ? "bg-orange-500 text-black"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                매장 관리
              </button>
            </div>
            <div className="bg-white p-6 rounded-b-xl shadow-md">
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

        {roleLevel !== 3 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
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
