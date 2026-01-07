import { useState, useEffect } from "react";
import robotImage from "../../assets/inufleet_robot_1.png";
import type { LoginRequest, LoginResponse } from "../../type";
import { getAuthToken } from "../api/LoginApi";
import { useNavigate } from "react-router-dom";
import { XCircle, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store";

export default function LoginPage() {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = robotImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  const handleSubmit = async () => {
    if (!userId.trim() || !password.trim()) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const data: LoginResponse = await getAuthToken({
        id: userId,
        pw: password,
      });

      useAuthStore.getState().login(data);
      navigate("/", { replace: true });
    } catch (error) {
      setLoginError("아이디 또는 비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#c9c9c9]"
    >
      {/* ===== 중앙 고정 카드 ===== */}
      <div className="w-[1100px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-2">
        {/* ===== LEFT IMAGE ===== */}
        <div className="flex items-center justify-center bg-gradient-to-br from-[#15191B] to-[#15191B]">
          <img
            src={robotImage}
            alt="robot"
            className="w-[600px] h-auto object-contain transition-opacity duration-300 bg-inherit"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </div>

        {/* ===== RIGHT LOGIN ===== */}
        <div className="flex flex-col justify-center px-10">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              로그인
            </h1>
            <span className="text-black font-extrabold text-xl">Inu</span>
            <span className="text-red-600 font-extrabold text-xl">fleet</span>&nbsp;
            <span className="mt-1 text-sm text-gray-500 font-bold">
              스마트 로봇 관리 플랫폼
            </span>
          </div>

          {loginError && (
            <div className="mb-4 flex items-center rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <XCircle className="mr-2 h-5 w-5" />
              {loginError}
            </div>
          )}

          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mb-3 rounded-lg border px-4 py-3 outline-none focus:border-[#4A607A]"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:border-[#4A607A]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <Eye/> : <EyeOff />}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-[#BA1E1E] py-3 font-semibold text-white hover:bg-[#324153]"
          >
            로그인
          </button>

          <p className="mt-6 text-center text-xs text-gray-400">
            비밀번호를 잊어버렸다면 <br />
            <span className="font-semibold text-red-500">
              관리자에게 문의
            </span>
            하여 재설정할 수 있습니다.
          </p>
        </div>
      </div>

      {/* ===== 모바일 대응 ===== */}
      <style>{`
        @media (max-width: 880px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
          .grid > div:first-child {
            display: none;
          }
          .w-[600px] {
            width: 90%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
