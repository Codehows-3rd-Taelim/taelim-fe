import { useAuthStore } from "../../store";
import AdminDashboardPage from "./AdminDashboardPage";
import UserDashboardPage from "./UserDashboardPage";
import { ROLE_LEVEL } from "../../lib/constants";

// 로딩 상태를 표시할 컴포넌트
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-full">
    <div className="text-lg text-gray-500">대시보드 로딩 중...</div>
  </div>
);

export default function DashboardPage() {
  const roleLevel = useAuthStore((s) => s.roleLevel);

  if (roleLevel === null) return <LoadingScreen />;

  if (roleLevel === ROLE_LEVEL.USER || roleLevel === ROLE_LEVEL.MANAGER) return <UserDashboardPage />;
  if (roleLevel === ROLE_LEVEL.ADMIN) return <AdminDashboardPage />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-red-500">🚫 접근 권한 없음</h2>
    </div>
  );
}
