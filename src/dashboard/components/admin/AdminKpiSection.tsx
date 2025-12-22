import type { AdminDashboardData } from "../../../type";

export default function AdminKpiSection({ data }: { data: AdminDashboardData }) {
  const box = "p-4 bg-white shadow rounded-xl border text-center";

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className={box}>
        <div className="text-gray-500 text-sm">총 로봇 수</div>
        <div className="text-3xl font-bold">{data.totalRobots}</div>
      </div>

      <div className={box}>
        <div className="text-gray-500 text-sm">가동 중</div>
        <div className="text-3xl font-bold text-green-600">{data.totalWorking}</div>
      </div>

      <div className={box}>
        <div className="text-gray-500 text-sm">오프라인</div>
        <div className="text-3xl font-bold text-red-600">{data.totalOffline}</div>
      </div>
    </div>
  );
}