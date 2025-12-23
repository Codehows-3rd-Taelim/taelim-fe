import { useEffect, useState } from "react";
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
// import AdminRobotTopChart from "../components/admin/AdminRobotTopChart";
// import AdminStoreStatusDonut from "../components/admin/AdminStoreStatusDonut";
// import AdminIndustryCompareChart from "../components/admin/AdminIndustryCompareChart";

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

    const start = range[0].startOf("day").format("YYYY-MM-DD");
    const end = range[1].endOf("day").format("YYYY-MM-DD");

    fetchReports({ startDate: start, endDate: end });
  }, [range, fetchStores, fetchRobots, fetchReports]);

  const data = useDashboardAdmin(stores, robots, reports, industries);

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

      {/* <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">로봇 TOP 작업시간</h2>
        <AdminRobotTopChart data={data.robotTopTime} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">매장 상태 비율</h2>
        <AdminStoreStatusDonut data={data.storeStatusCount} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">산업별 매장 수</h2>
          <AdminIndustryCompareChart data={data.industryStoreCount} />
      </div> */}

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
  );
}
