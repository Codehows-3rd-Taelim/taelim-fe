import { useState, useEffect } from "react";
import robotImage from "../../assets/robot.png";
import type { LoginRequest, LoginResponse } from "../../type";
import { getAuthToken } from "../api/LoginApi";
import { useNavigate } from "react-router-dom";
import { XCircle, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 이미 로그인되어 있으면 메인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Enter 키로 로그인
  const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // 로그인 처리
  const handleSubmit = async () => {
    if (!userId.trim() || !password.trim()) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoginError(null);

    const loginUser: LoginRequest = {
      id: userId,
      pw: password,
    };

    try {
      const data: LoginResponse = await getAuthToken(loginUser);

      useAuthStore.getState().login({
        jwtToken: data.jwtToken,
        roleLevel: data.roleLevel,
        storeId: data.storeId,
      });

      console.log("로그인 성공:", data);
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-inter">
      {/* 왼쪽 이미지 */}
      <div className="hidden md:flex md:w-[55%] justify-center items-center p-4">
        <img
          src={robotImage}
          alt="robots"
          className="w-[85%] h-auto object-contain max-h-[85vh]"
        />
      </div>

      {/* 오른쪽 로그인 */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-4 min-h-screen md:min-h-0">
        <div className="w-full max-w-md">
          {/* 제목 */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">로그인</h1>
            <div className="text-4xl font-bold">
              <span className="text-gray-900">Inus</span>
              <span className="text-red-600">tree</span>
              <span className="text-gray-500 text-xl font-normal ml-2">
                로봇관리 플랫폼
              </span>
            </div>
          </div>

          <div className="border-2 border-amber-300 rounded-xl shadow-2xl p-8 bg-white">
            {/* 오류 메시지 */}
            {loginError && (
              <div className="flex items-center p-3 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* 아이디 */}
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-base text-gray-700 focus:border-amber-400 focus:shadow-md"
              />

              {/* 비밀번호 */}
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* 버튼 */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-orange-600 text-black font-semibold rounded-lg text-lg mt-4 shadow-md hover:bg-orange-700"
              >
                로그인
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-6 text-center">
              비밀번호를 잊어버렸다면<br />
              <span className="text-orange-600 font-semibold">관리자에게 문의</span>하여
              재설정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}