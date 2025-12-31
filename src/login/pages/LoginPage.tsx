import { useState, useEffect } from "react";
import robotImage from "../../assets/robot.png";
import type { LoginRequest, LoginResponse } from "../../type";
import { getAuthToken } from "../api/LoginApi";
import { useNavigate } from "react-router-dom";
import { XCircle, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 이미지 preload
  useEffect(() => {
    const img = new Image();
    img.src = robotImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  // 이미 로그인되어 있으면 메인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

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
        userId: data.userId,
      });

      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data === "string"
            ? error.response.data
            : "아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요..";

        setLoginError(message);
      } else {
        setLoginError("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col min-w-full min-h-screen bg-white md:flex-row font-inter">
      {/* 왼쪽 이미지 - 패딩 줄임 */}
      <div className="hidden md:flex md:w-[55%] md:min-w-[55%] justify-center items-center pr-2">
        <img
          src={robotImage}
          alt="robots"
          className="w-[85%] h-auto object-contain max-h-[85vh] transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </div>

      {/* 오른쪽 로그인 - 패딩 줄임 */}
      <div className="w-full md:w-[45%] md:min-w-[45%] flex items-center justify-center pl-2 py-4 min-h-screen md:min-h-0">
        <div className="w-full max-w-md min-w-[450px]">
          {/* 제목 */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-4xl font-extrabold text-gray-800">
              로그인
            </h1>

            <div className="text-4xl font-bold">
              <span className="text-gray-900">Inus</span>
              <span className="text-red-600">tree</span>
              <span className="ml-2 text-xl font-normal text-gray-500 whitespace-nowrap">
                스마트 로봇 관리 플랫폼
              </span>
            </div>
          </div>

          <div className="border-2 border-amber-300 rounded-xl shadow-2xl p-8 bg-white min-w-[400px]">
            {/* 오류 메시지 */}
            {loginError && (
              <div className="flex items-center p-3 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <XCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                <span className="whitespace-pre-line">{loginError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* 아이디 */}
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 text-base text-gray-700 border border-gray-300 rounded-lg outline-none focus:border-amber-400 focus:shadow-md"
              />

              {/* 비밀번호 */}
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  className="w-full px-4 py-3 pr-12 text-gray-700 border border-gray-300 rounded-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
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
                className="w-full py-3 mt-4 text-lg font-semibold text-black bg-orange-600 rounded-lg shadow-md hover:bg-orange-700"
              >
                로그인
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-gray-400">
              비밀번호를 잊어버렸다면
              <br />
              <span className="font-semibold text-orange-600">
                관리자에게 문의
              </span>
              하여 재설정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
