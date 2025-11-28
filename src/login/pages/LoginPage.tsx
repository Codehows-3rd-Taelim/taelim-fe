import { useState, useEffect } from "react";
import robotImage from "../../assets/robot.png";
import type { LoginRequest, LoginResponse } from "../../type";
import { getAuthToken } from "../api/LoginApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PasswordToggle from "../../Components/PasswordToggle";

export default function LoginPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 추가

    // 화면 크기 체크
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 이미 로그인되어 있으면 메인 페이지로 리다이렉트
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async () => {
        const loginUser: LoginRequest = {
            id: userId,
            pw: password,
        };

        try {
            const data: LoginResponse = await getAuthToken(loginUser);
            console.log("로그인 성공:", data);

            // JWT 저장
            localStorage.setItem("jwtToken", data.jwtToken);
            localStorage.setItem("roleLevel", data.roleLevel.toString());
            localStorage.setItem("storeId", data.storeId.toString());

            // 로그인 후 페이지 이동
            navigate("/", { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("로그인 실패:", error.response?.data || error.message);
            } else {
                console.error("알 수 없는 오류:", error);
            }
            alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
        }
    };

    const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", backgroundColor: "white" }}>
            {/* 왼쪽 이미지 영역: 모바일에서는 숨김 */}
            {!isMobile && (
                <div
                    style={{
                        width: "60%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "5px",
                        backgroundColor: "transparent",
                    }}
                >
                    <img
                        src={robotImage}
                        alt="robots"
                        style={{ width: "100%", height: "auto", objectFit: "contain" }}
                    />
                </div>
            )}

            {/* 오른쪽 로그인 폼 영역 */}
            <div
                style={{
                    width: isMobile ? "100%" : "40%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    padding: "10px",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ width: "100%", maxWidth: "400px" }}>
                    <div style={{ marginBottom: "16px", textAlign: "center" }}>
                        <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "2px", color: "#1f2937" }}>
                            로그인
                        </h1>
                        {/* 로고 */}
                        <div style={{ marginBottom: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                                <span style={{ color: "black" }}>Inus</span>
                                <span style={{ color: "#dc2626" }}>tree</span>&nbsp;
                                <span style={{ color: "#4b5563", fontSize: "20px" }}>
                                    로봇관리 플랫폼
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            border: "2px solid #fed7aa",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            padding: "32px",
                            backgroundColor: "white",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "4px",
                                        outline: "none",
                                        fontSize: "14px",
                                        color: "#1f2937",
                                        fontFamily: "inherit",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.style.outline = "none";
                                        target.style.boxShadow = "0 0 0 2px #fed7aa";
                                    }}
                                    onBlur={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.style.boxShadow = "none";
                                    }}
                                />
                            </div>

                            {/* 비밀번호 입력 필드 (눈 아이콘 포함) */}
                            <PasswordToggle
                                password={password}
                                setPassword={setPassword}
                                handleKeyPress={handlePasswordKeyPress}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <button
                                onClick={handleSubmit}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    backgroundColor: "#f97316",
                                    color: "white",
                                    fontWeight: "600",
                                    borderRadius: "4px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    marginTop: "16px",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    const target = e.target as HTMLButtonElement;
                                    target.style.backgroundColor = "#ea580c";
                                }}
                                onMouseOut={(e) => {
                                    const target = e.target as HTMLButtonElement;
                                    target.style.backgroundColor = "#f97316";
                                }}
                            >
                                로그인
                            </button>
                        </div>

                        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "24px", textAlign: "center", lineHeight: "1.6" }}>
                            비밀번호를 잊어버렸다면<br />
                            <span style={{ color: "#f97316", fontWeight: "600" }}>관리자에게 문의</span>하여
                            비밀번호를 재설정할 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}