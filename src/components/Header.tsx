import { useEffect, useState } from "react";
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
  Database,
} from "lucide-react";
import useOperationManagement from "../operationManagement/hook/useOperationManagement";
import type { SyncRecordDTO, User as UserType } from "../type";
import { getLastSyncTime, syncNow } from "../sync/syncApi";

export default function Header() {
  const navigate = useNavigate();

  const [lastSync, setLastSync] = useState<string | null>(null);
  const [globalSync, setGlobalSync] = useState<string | null>(null);

  // 로그인한 사용자 정보
  const { logout, roleLevel, storeId, userId } = useAuthStore();

  // OperationManagement 훅 사용 → storeName / user 목록 조회 가능
  const { getStoreName, list: userList } = useOperationManagement();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

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
    { name: "홈", path: "/", icon: Home, minRoleLevel: 1 },
    { name: "AI보고서", path: "/ai/report", icon: FileText, minRoleLevel: 1 },
    { name: "대시보드", path: "/dashboard", icon: BarChart3, minRoleLevel: 1 },
    { name: "작업목록 / 보고서", path: "/report", icon: ClipboardList, minRoleLevel: 1 },
    { name: "운영 관리", path: "/manage", icon: Users, minRoleLevel: 1 },
    { name: "데이터 관리", path: "/data", icon: Database, minRoleLevel: 3 }, // 관리자만
  ];
  
  /* roleLevel 기준 필터링 메뉴 생성 */
  const safeRoleLevel = roleLevel ?? 0;

  const visibleNavItems = navItems.filter(
    (item) => safeRoleLevel >= item.minRoleLevel
  );
  
  useEffect(() => {
    loadLastSync();
  }, []);

  const loadLastSync = async () => {
    try {
      const info: SyncRecordDTO = await getLastSyncTime();
      setLastSync(info.lastSyncTime);
      setGlobalSync(info.globalSyncTime);
    } catch (e) {
      console.error(e);
    }
  };

  const formatSyncTime = () => {
    // 관리자: 항상 globalSyncTime 기준
    if (roleLevel === 3) {
      if (globalSync)
        return `마지막 동기화: ${new Date(globalSync).toLocaleString()}`;
      return "동기화 정보 없음";
    }

    // 일반 사용자
    if (lastSync)
      return `마지막 동기화: ${new Date(lastSync).toLocaleString()}`;

    if (globalSync)
      return `마지막 동기화(전체): ${new Date(globalSync).toLocaleString()}`;

    return "동기화 정보 없음";
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);

      const message = await syncNow();
      alert("동기화 완료\n" + message);

      // 동기화 완료 → 마지막 시간 다시 불러오기
      await loadLastSync();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(err);
      alert("동기화 실패!: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-lg bg-linear-to-r from-orange-400 to-orange-500">
      <div className="px-4 md:px-6">
        <div className="relative flex items-center justify-between h-16">
          {/* 모바일: 햄버거 메뉴 (맨 왼쪽) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="z-10 p-2 text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 태블릿/데스크탑: 로고 */}
          <div className="items-center hidden lg:flex">
            {/* 로고 */}
            <div
              className="text-xl font-bold tracking-wide text-white cursor-pointer whitespace-nowrap"
              onClick={() => navigate("/")}
            >
              Inufleet
            </div>
          </div>

          {/* 중앙: 메뉴 아이콘들 (lg 이상) */}
          <div className="items-center justify-center flex-1 hidden lg:flex">
            {/* 메뉴 - 아이콘만 (lg ~ 2xl 미만) */}
            <nav className="flex items-center justify-center flex-1 gap-4 xl:gap-6 2xl:hidden">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center justify-center p-3 text-white transition-colors rounded-lg hover:bg-white/10"
                    title={item.name}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                  </button>
                );
              })}
            </nav>

            {/* 메뉴 - 아이콘 + 텍스트 (2xl 이상, 1500px 이상) */}
            <nav className="items-center justify-center flex-1 hidden gap-1 2xl:flex">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg hover:bg-white/10 whitespace-nowrap"
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 모바일: 로고 (중앙) */}
          <div
            className="absolute text-lg font-bold tracking-wide text-white transform -translate-x-1/2 cursor-pointer left-1/2 lg:hidden whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            Inufleet
          </div>

          {/* 오른쪽: 동기화 버튼 + 사용자 메뉴 */}
          <div className="z-10 flex items-center gap-2 lg:gap-4">
            {/*  동기화 시간 표시 (lg 이상) */}
            <div className="hidden text-xs xl:text-sm text-white lg:block whitespace-nowrap">
              {formatSyncTime()}
            </div>

            {/* 동기화 버튼 */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`
              flex items-center justify-center
              px-3 lg:px-6 py-1.5 lg:py-2
              text-white text-xs lg:text-sm font-semibold rounded-lg shadow-md transition-colors whitespace-nowrap
              ${
                isSyncing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            `}
            >
              <div className="w-10 lg:w-[50px] flex justify-center">
                {isSyncing ? (
                  <svg
                    className="w-4 h-4 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "동기화"
                )}
              </div>
            </button>

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <User size={24} className="lg:w-7 lg:h-7 flex-shrink-0" />
                <div className="flex-col items-start hidden sm:flex">
                  <span className="text-sm font-medium leading-tight whitespace-nowrap">
                    {getUserDisplayText()}
                  </span>
                  {getUserSubText() && (
                    <span className="text-xs leading-tight opacity-90 whitespace-nowrap">
                      {getUserSubText()}님
                    </span>
                  )}
                </div>
                <div className="hidden sm:block flex-shrink-0">
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
                  <div className="absolute right-0 z-20 w-full mt-2 overflow-hidden bg-orange-400 rounded-lg shadow-lg">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-3 font-medium text-center text-white transition-colors hover:bg-white/10 whitespace-nowrap"
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
          <div className="py-4 border-t lg:hidden border-white/20">
            <nav className="flex flex-col gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
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