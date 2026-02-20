import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { getReportsForDashboard } from "../../report/api/ReportApi";
import { getRobots } from "../../robot/api/RobotApi";
import { getStores } from "../../operationManagement/api/StoreApi";
import { MAX_STORE_FETCH } from "../../lib/constants";
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

import type { Report, Robot, Store } from "../../type";

export default function UserDashboardPage() {

  //  상태
  const [reports, setReports] = useState<Report[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  const storeId = useAuthStore((s) => s.storeId ?? undefined);

  //  날짜 범위
  const [range, setRange] = useState<DateRange<Dayjs>>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  //  매장명
  const storeName =
    stores.find((s) => s.storeId === storeId)?.shopName ?? "매장";

  //  대시보드 가공 데이터
  const { data, hourlyWage, setHourlyWage } = useDashboard(reports, robots);

  //  데이터 로딩
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let cancelled = false;

    const loadData = async () => {
      if (!storeId || !range[0] || !range[1]) return;

      try {
        setLoading(true);

        const start = range[0].startOf("day").format("YYYY-MM-DD");
        const end = range[1].endOf("day").format("YYYY-MM-DD");

        const [storeRes, robotRes, reportRes] = await Promise.all([
          getStores(1, MAX_STORE_FETCH, controller.signal), // 매장 정보
          getRobots(storeId, controller.signal), // 해당 매장 로봇
          getReportsForDashboard({
            storeId,
            startDate: start,
            endDate: end,
          }, controller.signal), // 리포트
        ]);

        if (cancelled) return;
        setStores(storeRes.content);
        setRobots(robotRes);
        setReports(reportRes);
      } catch (err) {
        if (cancelled || axios.isCancel(err)) return;
        console.error("대시보드 데이터 로딩 실패", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [storeId, range]);

  //  로딩 처리
  if (loading || !data) {
    return <div className="p-6">데이터 로딩 중...</div>;
  }

  //  렌더링
  return (
    <div className="w-full max-w-[1400px] pb-6 mx-auto px-4 lg:px-6 space-y-6 bg-gray-100 mt-5">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{storeName} 대시보드</h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPI */}
      <KpiSection performance={data.performance} />

      {/* 그래프 & 성과 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 rounded-xl shadow-lg text-center">
          <h3 className="font-semibold mb-4">로봇 상태 현황</h3>
          <RobotDonutChart data={data.robotStatus} />
        </div>

        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-lg">
          <h3 className="font-semibold mb-4 text-center">작업 성과</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <PerformanceCards
              performance={data.performance}
              hourlyWage={hourlyWage}
              setHourlyWage={setHourlyWage}
            />
          </div>
        </div>
      </div>

      {/* 로봇 목록 */}
      <div className="bg-white p-4 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="font-semibold mb-4 text-xl">
          로봇 목록 ({robots.length}대)
        </h3>
        <RobotTable robots={robots} />
      </div>

      {/* 하단 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-3 text-center">구역별 청소 횟수</h4>
          <AreaCleanCountChart data={data.areaCleanCount} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-3 text-center">
            일별 로봇 가동 시간 (h)
          </h4>
          <DailyCleanTimeChart data={data.dailyOperationTime} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-3 text-center">일별 작업 상태</h4>
          <TaskStatusChart data={data.dailyTaskStatus} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-3 text-center">완료율</h4>
          <CompletionRateChart data={data.dailyCompletionRate} />
        </div>
      </div>
    </div>
  );
}
