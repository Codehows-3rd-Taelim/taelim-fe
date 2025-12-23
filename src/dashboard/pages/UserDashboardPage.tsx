import { useEffect, useState } from "react";
import { useAuthStore } from "../../store";
import { useDataStore } from "../../dataStore";
import DateRangePicker from "../../components/DateRangePicker";
import dayjs, { Dayjs } from "dayjs";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

import KpiSection from "../components/user/KpiSection";
import RobotDonutChart from "../components/user/RobotDonutChart";
import PerformanceCards from "../components/user/PerformanceCards";
import RobotTable from "../components/user/RobotTable";
import AreaCleanCountChart from "../components/user/AreaCleanCountChart";
import DailyCleanTimeChart from "../components/user/DailyCleanTimeChart";
import TaskStatusChart from "../components/user/TaskStatusChart";
import CompletionRateChart from "../components/user/CompletionRateChart";
import useDashboard from "../hooks/useDashboard";

export default function UserDashboardPage() {
  const storeId = useAuthStore((s) => s.storeId ?? undefined);

  const { stores, reports, robots, fetchReports, fetchRobots, fetchStores } =
    useDataStore();

  const storeName =
    stores.find((store) => store.storeId === storeId)?.shopName ?? "매장";

  // ReportPage와 동일한 DateRange 타입 사용
  const [range, setRange] = useState<DateRange<Dayjs>>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  const { data, hourlyWage, setHourlyWage } = useDashboard(reports, robots);

  // 최초 stores가 비어있을 수 있으므로 보장해줌
  useEffect(() => {
    fetchStores();
  }, []);

  // 날짜 변경 시 데이터 호출
  useEffect(() => {
    if (!storeId || !range[0] || !range[1]) return;

    const start = range[0].startOf("day").format("YYYY-MM-DD");
    const end = range[1].endOf("day").format("YYYY-MM-DD");

    fetchReports({ storeId, startDate: start, endDate: end });
    fetchRobots(storeId);
  }, [storeId, range, fetchReports, fetchRobots]);

  if (!data) return <div className="p-6">데이터 로딩 중...</div>;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-6 space-y-6">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{storeName} 대시보드</h2>

        {/* ReportPage 방식의 DateRangePicker 그대로 사용 */}
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPI - 전체 performance 객체 전달 */}
      <KpiSection performance={data.performance} />

      {/* 그래프 & 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 bg-white p-4 rounded-xl shadow min-w-[350px]">
          <h3 className="font-semibold mb-4">로봇 상태 현황</h3>
          <RobotDonutChart data={data.robotStatus} />
        </div>

        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">작업 성과</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerformanceCards
              performance={data.performance}
              hourlyWage={hourlyWage}
              setHourlyWage={setHourlyWage}
            />
          </div>
        </div>
      </div>

      {/* 로봇 목록 */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <h3 className="font-semibold mb-4 text-xl">
          로봇 목록 ({robots?.length ?? 0}대)
        </h3>
        <RobotTable robots={robots ?? []} />
      </div>

      {/* 하단 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-3">구역별 청소 횟수</h4>
          <AreaCleanCountChart data={data.areaCleanCount} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-3">일별 로봇 가동 시간 (h)</h4>
          <DailyCleanTimeChart data={data.dailyOperationTime} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-3">일별 작업 상태</h4>
          <TaskStatusChart data={data.dailyTaskStatus} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-3">완료율</h4>
          <CompletionRateChart data={data.dailyCompletionRate} />
        </div>
      </div>
    </div>
  );
}
