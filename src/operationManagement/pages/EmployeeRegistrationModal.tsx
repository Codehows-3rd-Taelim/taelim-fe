import PasswordToggle from "../../components/PasswordToggle";

interface RegistrationForm {
  id: string;
  pw: string;
  pwCheck: string;
  name: string;
  phone: string;
  email: string;
  storeId: number;
  role: string;
}

interface EmployeeRegistrationModalProps {
  form: RegistrationForm;
  setFormValue: (key: keyof RegistrationForm, value: string | number) => void;
  isIdChecked: boolean;
  handleIdCheck: () => void;
  isPasswordMismatched: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showPasswordCheck: boolean;
  setShowPasswordCheck: (show: boolean) => void;
  isRegisterButtonEnabled: boolean;
  handleRegister: () => void;
  allStores: { storeId: number; shopName: string }[];
  roleLevel: number;
  handlePasswordKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onCancelConfirm: () => void;
  isMobileLayout: boolean;
}

export default function EmployeeRegistrationModal({
  form,
  setFormValue,
  isIdChecked,
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
  handlePasswordKeyPress,
  onClose,
  onCancelConfirm,
  isMobileLayout,
}: EmployeeRegistrationModalProps) {
  const hasRegistrationPermission = roleLevel !== 1;

  // form이 undefined인 경우 처리
  if (!form) {
    return null;
  }

  const handlePasswordToggle = (field: "pw" | "pwCheck") => (value: string) => {
    setFormValue(field, value);
  };

  const handleClose = () => {
    const hasInput =
      form.id ||
      form.pw ||
      form.pwCheck ||
      form.name ||
      form.phone ||
      form.email ||
      form.storeId !== 0;

    if (hasInput) {
      if (window.confirm("정말로 등록을 취소하시겠습니까?")) {
        onCancelConfirm();
      }
    } else {
      onClose(); // 입력 없으면 그냥 닫기
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");

    // 010 강제
    let phone = numbersOnly;
    if (!phone.startsWith("010")) {
      phone = "010" + phone.replace(/^010*/, "");
    }

    // 11자리 제한
    phone = phone.slice(0, 11);

    // 하이픈 포맷
    if (phone.length === 11) {
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormValue("phone", formatted);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border border-gray-300 ${
          isMobileLayout ? "p-4 w-full max-w-md" : "p-6 w-full max-w-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">직원 등록</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {!hasRegistrationPermission && (
          <div className="text-center text-orange-500 font-bold mb-4 p-3 bg-orange-50 rounded-lg">
            직원 등록 권한이 없습니다.
          </div>
        )}

        {/* 폼 영역 - 세로 레이아웃 */}
        <div
          className={`${
            !hasRegistrationPermission ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex flex-col gap-3">
            {/* ID & 중복확인 */}
            <div className="flex gap-2">
              <input
                name="id"
                value={form.id}
                onChange={(e) => setFormValue("id", e.target.value)}
                placeholder="ID (필수)"
                className="border rounded-md p-2 h-10 flex-1"
                disabled={!hasRegistrationPermission}
              />
              <button
                onClick={handleIdCheck}
                className={`h-10 px-4 rounded-md whitespace-nowrap font-medium ${
                  isIdChecked
                    ? "bg-green-600 text-white"
                    : "bg-orange-500 text-white"
                }`}
                disabled={!hasRegistrationPermission}
              >
                {isIdChecked ? "✓ 확인" : "중복확인"}
              </button>
            </div>
            {!isIdChecked && (
              <span className="text-red-500 text-xs mt-1 block">
                중복확인 완료 후 등록이 가능합니다.
              </span>
            )}
            {/* 비밀번호 */}
            <div className="w-full">
              <PasswordToggle
                password={form.pw}
                setPassword={handlePasswordToggle("pw")}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleKeyPress={handlePasswordKeyPress}
                placeholder="비밀번호 (필수)"
              />

              {form.pw.length > 0 && form.pw.length < 8 && (
                <span className="text-red-500 text-xs mt-1 block">
                  비밀번호는 8자 이상입니다.
                </span>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <PasswordToggle
                password={form.pwCheck}
                setPassword={handlePasswordToggle("pwCheck")}
                showPassword={showPasswordCheck}
                setShowPassword={setShowPasswordCheck}
                handleKeyPress={handlePasswordKeyPress}
                placeholder="비밀번호 확인 (필수)"
              />
              {isPasswordMismatched && (
                <span className="text-red-500 text-xs mt-1 block">
                  비밀번호가 다릅니다
                </span>
              )}
            </div>

            {/* 이름 */}
            <input
              name="name"
              value={form.name}
              onChange={(e) => setFormValue("name", e.target.value)}
              placeholder="이름 (필수)"
              className="border rounded-md p-2 h-10 w-full"
              disabled={!hasRegistrationPermission}
            />

            {/* 연락처 */}
            <div>
              <input
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="연락처 (010으로 시작)"
                className="border rounded-md p-2 h-10 w-full"
                disabled={!hasRegistrationPermission}
              />

              {form.phone && form.phone.replace(/\D/g, "").length !== 11 && (
                <span className="text-red-500 text-xs mt-1 block">
                  휴대전화번호가 정확한지 확인해 주세요.
                </span>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <input
                name="email"
                value={form.email}
                onChange={(e) => setFormValue("email", e.target.value)}
                placeholder="email@gmail.com (필수)"
                className="border rounded-md p-2 h-10 w-full"
                disabled={!hasRegistrationPermission}
              />
              {form.email && !isValidEmail(form.email) && (
                <span className="text-red-500 text-xs mt-1 block">
                  이메일 형식이 올바르지 않습니다.
                </span>
              )}
            </div>

            {/* 매장 선택 */}
            <select
              name="storeId"
              value={form.storeId}
              onChange={(e) => setFormValue("storeId", Number(e.target.value))}
              className="border rounded-md p-2 h-10 w-full"
              disabled={!hasRegistrationPermission || roleLevel !== 3}
            >
              <option value={0}>매장 선택 (필수)</option>
              {allStores.map((s) => (
                <option key={s.storeId} value={s.storeId}>
                  {s.shopName}
                </option>
              ))}
            </select>

            {/* 권한 선택 */}
            <select
              name="role"
              value={form.role}
              onChange={(e) => setFormValue("role", e.target.value)}
              className="border rounded-md p-2 h-10 w-full"
              disabled={!hasRegistrationPermission || roleLevel !== 3}
            >
              <option value="MANAGER">매장 담당자</option>
              <option value="USER">직원</option>
            </select>

            {/* 등록 버튼 */}
            <button
              onClick={handleRegister}
              disabled={!isRegisterButtonEnabled || !hasRegistrationPermission}
              className={`h-10 px-4 rounded-md font-medium w-full mt-2 ${
                isRegisterButtonEnabled && hasRegistrationPermission
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
