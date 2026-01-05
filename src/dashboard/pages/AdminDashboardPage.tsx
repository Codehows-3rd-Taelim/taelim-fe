import { useEffect, useMemo, useState } from "react";
import { useDataStore } from "../../dataStore";
import useDashboardAdmin from "../hooks/useDashboardAdmin";
import DateRangePicker from "../../components/DateRangePicker";

import dayjs, { Dayjs } from "dayjs";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

import AdminKpiSection from "../components/admin/AdminKpiSection";
import AdminStoreTable from "../components/admin/AdminStoreTable";
import AdminIndustryTimeChart from "../components/admin/AdminIndustryTimeChart";
// import AdminStoreCleanTimeChart from "../components/admin/AdminStoreCleanTimeChart";
import AdminStoreCleanAreaChart from "../components/admin/AdminStoreCleanAreaChart";
import AdminOperationRateScatterChart from "../components/admin/AdminOperationRateScatterChart";
import AdminDashboardRanking from "../components/admin/AdminDashboardRanking";
import AdminRobotTopChart from "../components/admin/AdminRobotTopChart";
// import AdminStoreStatusDonut from "../components/admin/AdminStoreStatusDonut";
// import AdminIndustryCompareChart from "../components/admin/AdminIndustryCompareChart";
// import AdminStoreStatusDonut from "../components/admin/AdminStoreStatusDonut";
import AdminIndustryCompareChart from "../components/admin/AdminIndustryCompareChart";
import AdminTaskStatusDonut from "../components/admin/AdminTaskStatusDonut";
import type { TaskStatusDonut } from "../../type";

export default function AdminDashboardPage() {
  const {
    stores,
    robots,
    reports,
    industries,
    fetchStores,
    fetchReports,
    fetchRobots,
    fetchIndustries,
  } = useDataStore();

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // 사용자 대시보드와 동일한 초기 날짜 설정 (최근 7일)
  const [range, setRange] = useState<DateRange<Dayjs>>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  // 초기 로딩 시 industries 데이터 가져오기
  useEffect(() => {
    fetchIndustries();
  }, []);

  // 날짜 변경 시 전체 기간을 기반으로 관리자 보고서 조회
  useEffect(() => {
    fetchStores();
    fetchRobots();

    if (!range[0] || !range[1]) return;

    const start = range[0].startOf("day").format("YYYY-MM-DD 00:00:00");
    const end = range[1].endOf("day").format("YYYY-MM-DD 23:59:59");

    fetchReports({ startDate: start, endDate: end });
  }, [range, fetchStores, fetchRobots, fetchReports]);

  const data = useDashboardAdmin(stores, robots, reports, industries);

  const filteredReports = useMemo(() => {
    if (!selectedStoreId) return reports;
    return reports.filter((r) => r.storeId === selectedStoreId);
  }, [reports, selectedStoreId]);

  const taskStatusDonut = useMemo<TaskStatusDonut[]>(() => {
    const result = { FINISH: 0, INTERRUPT: 0, CANCEL: 0 };

    filteredReports.forEach((r) => {
      if (r.status === 0) result.CANCEL++;
      else if (r.status === 1 || r.status === 4) result.FINISH++;
      else result.INTERRUPT++;
    });

    return [
      { status: "FINISH", count: result.FINISH },
      { status: "INTERRUPT", count: result.INTERRUPT },
      { status: "CANCEL", count: result.CANCEL },
    ];
  }, [filteredReports]);

  return (
    <div className="pt-6 pb-10 w-full max-w-[1400px] mx-auto px-4 lg:px-6 bg-gray-100 space-y-10">
      {/* 1. 제목 + 날짜 */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold">관리자 대시보드</h3>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* 2. KPI 요약 */}
      <AdminKpiSection data={data} />

      {/* 3. 가동률 핵심 요약 */}
      <section className="space-y-6">
        <AdminDashboardRanking
          storeSummaries={data.storeSummaries}
          operationRateData={data.OperationRateScatterChart}
        />

        <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px]">
          <h2 className="text-xl font-semibold mb-4">매장별 가동률 분포</h2>
          <AdminOperationRateScatterChart
            data={data.OperationRateScatterChart}
          />
        </div>
      </section>

      {/* 4. 작업량 분석 (면적 + 상태) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 청소 면적 */}
        <div className="bg-white p-6 rounded-xl shadow-xl lg:col-span-2 min-h-[420px]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">
              매장별 총 청소 면적
              <span className="ml-2 text-sm text-slate-400">(누적)</span>
            </h2>
            <span className="text-xs text-slate-400">
              ※ 청소 이력 있는 매장만 집계
            </span>
          </div>
          <AdminStoreCleanAreaChart data={data.storeCleanArea} />
        </div>

        {/* 작업 상태 */}
        <div className="bg-white p-6 rounded-xl shadow min-h-[420px]">
          <h2 className="text-lg font-semibold mb-4">
            {selectedStoreId
              ? `${
                  stores.find((s) => s.storeId === selectedStoreId)?.shopName
                } 작업 상태`
              : "전체 매장 작업 상태"}
          </h2>

          <select
            className="mb-4 w-fit border rounded px-3 py-1 text-sm"
            value={selectedStoreId ?? ""}
            onChange={(e) =>
              setSelectedStoreId(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          >
            <option value="">전체</option>
            {stores.map((store) => (
              <option key={store.storeId} value={store.storeId}>
                {store.shopName}
              </option>
            ))}
          </select>

          {taskStatusDonut.every((d) => d.count === 0) ? (
            <div className="flex items-center justify-center h-[260px] text-gray-400">
              데이터 없음
            </div>
          ) : (
            <AdminTaskStatusDonut data={taskStatusDonut} />
          )}
        </div>
      </section>

      {/* 5. 시간 기반 분석 */}

      {/* <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px]">
          <h2 className="text-xl font-semibold mb-4">매장별 총 청소 시간</h2>
          <AdminStoreCleanTimeChart data={data.storeCleanTime} />
        </div> */}

      {/* 매장 요약 정보 */}
      <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">매장 요약 정보</h2>

        <div className="flex-1 overflow-hidden">
          <AdminStoreTable stores={data.storeSummaries} />
        </div>
      </div>
      {/* 6. 상세 관리 영역 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 로봇 TOP 작업 시간 */}
        <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">로봇 TOP 작업 시간</h2>

          <div className="flex-1 flex items-center">
            <AdminRobotTopChart data={data.robotTopTime} />
          </div>
        </div>

        {/* 산업별 매장 수 */}
        <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">산업별 매장 수</h2>

          <div className="flex-1 flex items-center">
            <AdminIndustryCompareChart data={data.industryStoreCount} />
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-xl min-h-[420px]">
          <h2 className="text-xl font-semibold mb-4">산업별 일별 가동 시간</h2>
          <AdminIndustryTimeChart data={data.industryOperationTime} />
        </div>
      </section>
    </div>
  );
}
