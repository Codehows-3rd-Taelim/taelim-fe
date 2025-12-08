import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import {
  Home,
  FileText,
  BarChart3,
  ClipboardList,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";
import useOperationManagement from "../operationManagement/hook/useOperationManagement";
import type { User as UserType } from "../type";

export default function Header() {
  const navigate = useNavigate();

  // 로그인한 사용자 정보
  const { logout, roleLevel, storeId, userId } = useAuthStore();

  // OperationManagement 훅 사용 → storeName / user 목록 조회 가능
  const { getStoreName, list: userList } = useOperationManagement();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  /** 사용자 이름 찾기 */
  const getUserName = (uid: number): string => {
    const user: UserType | undefined = userList.find(
      (u: UserType) => u.userId === uid
    );
    return user?.name ?? "";
  };

  /** roleLevel에 따라 헤더 상단 메인 표시 텍스트 결정 */
  const getUserDisplayText = () => {
    if (roleLevel === 3) {
      return "관리자";
    } else {
      return getStoreName(storeId!); // 매장 이름 표시
    }
  };

  /** roleLevel에 따라 서브 텍스트 표시 */
  const getUserSubText = () => {
    if (roleLevel !== 3) {
      return getUserName(userId!); // 사용자 이름 표시
    }
    return null;
  };

  const navItems = [
    { name: "홈", path: "/ai/chat", icon: Home },
    { name: "AI보고서", path: "/ai/report", icon: FileText },
    { name: "대시보드", path: "/dashboard", icon: BarChart3 },
    { name: "작업목록 / 보고서", path: "/report", icon: ClipboardList },
    { name: "운영 관리", path: "/manage", icon: Users },
  ];

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg">
      <div className="px-4 md:px-6">
        <div className="relative flex items-center justify-between h-16">
          {/* 모바일: 햄버거 메뉴 (맨 왼쪽) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 z-10"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 데스크탑: 로고 + 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            {/* 로고 */}
            <div
              className="text-white font-bold text-xl tracking-wide cursor-pointer"
              onClick={() => navigate("/")}
            >
              Inufleet
            </div>

            {/* 데스크탑 메뉴 */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 모바일: 로고 (중앙) */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 text-white font-bold text-lg tracking-wide cursor-pointer md:hidden"
            onClick={() => navigate("/")}
          >
            Inufleet
          </div>

          {/* 오른쪽: 동기화 버튼 + 사용자 메뉴 */}
          <div className="flex items-center gap-2 md:gap-4 z-10">
            {/* 동기화 버튼 */}
            <button className="flex items-center px-3 md:px-6 py-1.5 md:py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-md transition-colors">
              동기화
            </button>

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <User size={24} className="md:w-7 md:h-7" />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium leading-tight">
                    {getUserDisplayText()}
                  </span>
                  {getUserSubText() && (
                    <span className="text-xs leading-tight opacity-90">
                      {getUserSubText()}님
                    </span>
                  )}
                </div>
                <div className="hidden sm:block">
                  {isUserMenuOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </button>

              {/* 드롭다운 메뉴 */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-full bg-orange-400 rounded-lg shadow-lg overflow-hidden z-20">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-3 text-white font-medium text-center hover:bg-white/10 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}