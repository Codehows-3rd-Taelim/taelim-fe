import { useAuthStore } from "../../store";
import AdminDashboardPage from "./AdminDashboardPage";
import UserDashboardPage from "./UserDashboardPage";

// 로딩 상태를 표시할 컴포넌트
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-flex">
    <div className="text-lg text-gray-500">대시보드 로딩 중...</div>
  </div>
);

export default function DashboardPage() {
  const roleLevel = useAuthStore((s) => s.roleLevel);

  if (roleLevel === null) return <LoadingScreen />;

  if (roleLevel === 1 || roleLevel === 2) return <UserDashboardPage />;
  if (roleLevel === 3) return <AdminDashboardPage />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-red-500">🚫 접근 권한 없음</h2>
    </div>
  );
}
