import { Eye, EyeOff } from "lucide-react";

export default function PasswordToggle({
  password,
  setPassword,
  handleKeyPress,
  showPassword,
  setShowPassword,
  tabIndex,
  placeholder = "비밀번호를 입력하세요",
}: {
  password: string;
  setPassword: (password: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  tabIndex?: number;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-md text-gray-700 outline-none 
                   focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 transition"
        tabIndex={tabIndex}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none"
        tabIndex={tabIndex}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
