import { useState, useEffect } from "react";
import robotImage from "../../assets/robot.png";
import type { LoginRequest, LoginResponse } from "../../type";
import { getAuthToken } from "../api/LoginApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { XCircle, Eye, EyeOff } from "lucide-react"; // lucide-react 아이콘 사용 (Eye, EyeOff: 비밀번호 토글, XCircle: 오류)

export default function LoginPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null); // 로그인 오류 메시지 상태

    // isMobile 상태와 useEffect 로직은 Tailwind CSS가 처리하므로 제거되었습니다.
    
    // 이미 로그인되어 있으면 메인 페이지로 리다이렉트
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async () => {
        setLoginError(null); // 이전 오류 메시지 초기화
        
        const loginUser: LoginRequest = {
            id: userId,
            pw: password,
        };

        try {
            const data: LoginResponse = await getAuthToken(loginUser);
            console.log("로그인 성공:", data);

            // JWT 및 사용자 정보 저장 (localStorage 사용)
            localStorage.setItem("jwtToken", data.jwtToken);
            localStorage.setItem("roleLevel", data.roleLevel.toString());
            localStorage.setItem("storeId", data.storeId.toString());

            // 로그인 후 페이지 이동
            navigate("/", { replace: true });
        } catch (error) {
            const errorMessage = "로그인 실패: 아이디 또는 비밀번호를 확인하세요.";
            if (axios.isAxiosError(error)) {
                console.error("로그인 실패:", error.response?.data || error.message);
            } else {
                console.error("알 수 없는 오류:", error);
            }
            // alert() 대신 상태를 업데이트하여 화면에 오류 메시지를 표시합니다.
            setLoginError(errorMessage);
        }
    };

    const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };
    

    return (
        // 메인 컨테이너: 최소 높이 100vh, 데스크탑에서는 row, 모바일에서는 column
        <div className="min-h-screen flex flex-col md:flex-row bg-white font-inter">
            {/* 왼쪽 이미지 영역: 데스크탑에서만 보임 (hidden md:flex) */}
            <div className="hidden md:flex md:w-[60%] flex-col justify-center items-center p-4">
                <img
                    src={robotImage}
                    alt="robots"
                    // 이미지 크기 및 레이아웃 설정
                    className="w-full h-auto object-contain max-h-[90vh]"
                />
            </div>

            {/* 오른쪽 로그인 폼 영역 */}
            <div className="w-full md:w-[40%] flex items-center justify-center p-8 min-h-screen box-border">
                <div className="w-full max-w-sm">
                    {/* 로고 및 제목 */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-extrabold mb-1 text-gray-800">
                            로그인
                        </h1>
                        <div className="mb-4 text-center">
                            <div className="text-4xl font-bold">
                                <span className="text-gray-900">Inus</span>
                                <span className="text-red-600">tree</span>&nbsp;
                                <span className="text-gray-500 text-xl font-normal">
                                    로봇관리 플랫폼
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 로그인 카드 컨테이너 */}
                    <div className="border-2 border-amber-300 rounded-xl shadow-2xl p-8 bg-white transition-all duration-300 hover:shadow-2xl">
                        
                        {/* 로그인 오류 메시지 UI */}
                        {loginError && (
                            <div className="flex items-center p-3 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
                                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">오류:</span> {loginError}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                            {/* 아이디 입력 */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    // Tailwind Input 스타일: 전체 너비, 패딩, 둥근 모서리, 포커스 시 색상 변경
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-base text-gray-700 font-sans transition-all duration-150 focus:border-amber-400 focus:shadow-md focus:shadow-amber-100"
                                />
                            </div>

                            {/* 비밀번호 입력 필드 (눈 아이콘 포함) */}
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handlePasswordKeyPress}
                                    className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-md text-gray-700 outline-none
                                            focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 transition"
                                />
                                <button
                                    type="button"       
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700 **bg-transparent** border-none outline-none"  
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>


                            {/* 로그인 버튼 */}
                            <button
                                onClick={handleSubmit}
                                // Tailwind Button 스타일: 배경색, 둥근 모서리, 호버/액티브 효과
                                className="w-full py-3 px-4 bg-orange-600 text-black font-semibold rounded-lg border-none cursor-pointer text-lg mt-4 shadow-md hover:bg-orange-700 transition-colors duration-200 active:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                            >
                                로그인
                            </button>
                        </div>

                        {/* 안내 문구 */}
                        <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
                            비밀번호를 잊어버렸다면<br />
                            <span className="text-orange-600 font-semibold">관리자에게 문의</span>하여
                            비밀번호를 재설정할 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}