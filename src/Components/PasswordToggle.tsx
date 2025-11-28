interface PasswordToggleProps {
    password: string;
    setPassword: (password: string) => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
}

export default function PasswordToggle({
    password,
    setPassword,
    handleKeyPress,
    showPassword,
    setShowPassword,
}: PasswordToggleProps) {
    // 공통 input 스타일
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px 12px 16px",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        outline: "none",
        fontSize: "14px",
        color: "#1f2937",
        fontFamily: "inherit",
        boxSizing: "border-box",
        paddingRight: "40px", // 눈 아이콘 공간 확보
    };

    // input focus 시 스타일
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.outline = "none";
        e.target.style.boxShadow = "0 0 0 2px #fed7aa";
    };

    // input blur 시 스타일
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.boxShadow = "none";
    };

    const eyeIcon = showPassword ? (
        // 눈 뜬 아이콘
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        // 눈 감은 아이콘
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    return (
        <div style={{ position: "relative" }}>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            {/* 눈 아이콘 버튼 */}
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {eyeIcon}
            </button>
        </div>
    );
}