import { useEffect, useMemo, useState } from "react";
import { useDataStore } from "../../dataStore";
import useDashboardAdmin from "../hooks/useDashboardAdmin";
import DateRangePicker from "../../components/DateRangePicker";

import dayjs, { Dayjs } from "dayjs";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

import AdminKpiSection from "../components/admin/AdminKpiSection";
import AdminStoreTable from "../components/admin/AdminStoreTable";
import AdminIndustryTimeChart from "../components/admin/AdminIndustryTimeChart";
import AdminStoreCleanTimeChart from "../components/admin/AdminStoreCleanTimeChart";
import AdminStoreCleanAreaChart from "../components/admin/AdminStoreCleanAreaChart";
import AdminRobotTopChart from "../components/admin/AdminRobotTopChart";
import AdminStoreStatusDonut from "../components/admin/AdminStoreStatusDonut";
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
    return reports.filter(r => r.storeId === selectedStoreId);
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
    <div className="w-full p-6 space-y-6 bg-gray-100">
      {/* 헤더 + 날짜 선택 (사용자 대시보드 UI와 동일한 레이아웃) */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold">관리자 대시보드</h3>

        {/* 사용자 대시보드와 동일한 크기/디자인 */}
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPI */}
      <AdminKpiSection data={data} />

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">로봇 TOP 작업시간</h2>
        <AdminRobotTopChart data={data.robotTopTime} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">매장 상태 비율</h2>
          <AdminStoreStatusDonut data={data.storeStatusCount} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            {/* 제목 : 선택된 매장명 표시 */}
            <h2 className="text-lg font-semibold">
              {selectedStoreId
                ? `${stores.find(
                    (s) => s.storeId === selectedStoreId
                  )?.shopName ?? "알 수 없는 매장"} 작업 이력 상태`
                : "전체 매장 작업 이력 상태"}
            </h2>

            {/* 매장 선택 드롭다운 */}
            <select
              className="border rounded px-3 py-1 text-sm"
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
          </div>

          {/* 데이터 없을 때 안내 */}
          {taskStatusDonut.every((d) => d.count === 0) ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-xl">
              {selectedStoreId
                ? "선택한 매장의 작업 이력이 없습니다."
                : "조회된 작업 이력이 없습니다."}
            </div>
          ) : (
            <AdminTaskStatusDonut data={taskStatusDonut} />
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">산업별 매장 수</h2>
          <AdminIndustryCompareChart data={data.industryStoreCount} />
      </div>

      {/* 매장 테이블 */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">매장 요약 정보</h2>
        <AdminStoreTable stores={data.storeSummaries} />
      </div>

      {/* 차트 3종 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">산업별 일별 가동 시간</h2>
          <AdminIndustryTimeChart data={data.industryOperationTime} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">매장별 총 청소 시간</h2>
          <AdminStoreCleanTimeChart data={data.storeCleanTime} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">매장별 총 청소 면적</h2>
          <AdminStoreCleanAreaChart data={data.storeCleanArea} />
        </div>
      </div>
      </div>
    </div>
  );
}
