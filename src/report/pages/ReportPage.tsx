import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
dayjs.extend(isBetween);

import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import CleanReport from "./CleanReport";
import type { Report, Robot } from "../../type";
import { useAuthStore } from "../../store";
import useOperationManagement from "../../operationManagement/hook/useOperationManagement";
import { getRobots } from "../../robot/api/RobotApi";
import { getReports } from "../api/ReportApi";

type SortKey = "sn" | "storeName" | "mapName" | "startTime";
type SortOrder = "asc" | "desc";

export default function ReportPage() {
  const { roleLevel, storeId } = useAuthStore();
  const { getStoreName, allStores } = useOperationManagement();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [selectedSnInput, setSelectedSnInput] = useState("");
  const [selectedStoreIdInput, setSelectedStoreIdInput] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );

  const [dateRangeInput, setDateRangeInput] = useState<
    [Dayjs | null, Dayjs | null]
  >([dayjs().subtract(7, "day"), dayjs()]);

  const [selectedSn, setSelectedSn] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );

  const [ReportData, setReportData] = useState<Report[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const start = dateRangeInput[0] ?? dayjs().subtract(7, "day");
      const end = dateRangeInput[1] ?? dayjs();

      const params = {
        page: page - 1,
        size: 15,
        storeId: roleLevel === 3 ? undefined : storeId || undefined,
        filterStoreId: selectedStoreId === 0 ? undefined : selectedStoreId,
        sn: selectedSn || undefined,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        sortKey: sortKey || undefined,
        sortOrder: sortKey ? sortOrder : undefined,
      };

      const res = await getReports(params);
      setReportData(res.content);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
    };

    loadData();
  }, [
    dateRangeInput,
    roleLevel,
    storeId,
    page,
    selectedSn,
    selectedStoreId,
    sortKey,
    sortOrder,
  ]);

  useEffect(() => {
    const loadRobots = async () => {
      try {
        const targetStoreId =
          roleLevel === 3 ? undefined : storeId || undefined;
        const data = await getRobots(targetStoreId);
        setRobots(data);
      } catch (err) {
        console.error("로봇 목록 불러오기 실패", err);
      }
    };
    loadRobots();
  }, [roleLevel, storeId]);

  const formatDynamicTime = (cleanTimeSeconds: number) => {
    const totalSeconds = Math.floor(cleanTimeSeconds);
    if (totalSeconds === 0) return "-";
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours === 0
      ? `${totalMinutes}분 ${seconds}초`
      : `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  const handleSort = (key: SortKey) => {
    // 처음 클릭 → 오름차순
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    }
    // 오름차순 → 내림차순
    else if (sortOrder === "asc") {
      setSortOrder("desc");
    }
    // 내림차순 → 정렬 해제
    else {
      setSortKey(null);
      setSortOrder("desc"); // 기본값 유지
    }

    setPage(1);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;

    return sortOrder === "desc" ? (
      <ArrowUpwardIcon className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDownwardIcon className="w-4 h-4 inline ml-1" />
    );
  };

  const handleSearch = () => {
    setSelectedSn(selectedSnInput);
    setSelectedStoreId(selectedStoreIdInput);
    setPage(1);
  };

  const handleReset = () => {
    setDateRangeInput([null, null]);
    setSelectedSnInput("");
    setSelectedSn("");
    const defaultStoreId = roleLevel === 3 ? 0 : storeId || 0;
    setSelectedStoreIdInput(defaultStoreId);
    setSelectedStoreId(defaultStoreId);
    setPage(1);
  };

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  const filteredRobots =
    selectedStoreIdInput === 0
      ? robots
      : robots.filter((r) => r.storeId === selectedStoreIdInput);

  const getRowIndex = (index: number) => {
    const baseIndex = (page - 1) * 15 + index;

    // 정렬 해제 or desc → 최신이 큰 번호
    if (!sortKey || sortOrder === "desc") {
      return totalElements - baseIndex;
    }

    // asc
    return baseIndex + 1;
  };

  const MobileReportCard = ({
    report,
    index,
  }: {
    report: Report;
    index: number;
  }) => {
    return (
      <div
        onClick={() => handleRowClick(report)}
        className="bg-white rounded-xl shadow-md p-4 space-y-2 cursor-pointer active:scale-[0.98] transition"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            No. {getRowIndex(index)}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {getStoreName(report.storeId)}
          </span>
        </div>

        <div className="text-sm">
          <span className="font-medium">구역: </span> {report.mapName}
        </div>

        <div className="text-sm">
          <span className="font-medium">시작: </span> {report.startTime}
        </div>

        <div className="text-sm">
          <span className="font-medium">종료: </span> {report.endTime}
        </div>

        <div className="flex justify-between text-sm pt-2 border-t">
          <div>
            ⏱ {formatDynamicTime(report.cleanTime)}
          </div>
          <div>
            📐 {report.cleanArea ?? "-"}㎡
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full max-w-[1600px] mx-auto pt-1 px-4 lg:px-6 space-y-6 bg-gray-100">

      {/* ================= 모바일 전용 정렬 ================= */}
      <div className="lg:hidden flex gap-2">
        <select
          value={sortKey ?? ""}
          onChange={(e) => {
            const v = e.target.value as SortKey;
            setSortKey(v || null);
            setSortOrder("asc");
            setPage(1);
          }}
          className="flex-1 px-3 py-2 border rounded"
        >
          <option value="">정렬 없음</option>
          <option value="sn">SN</option>
          <option value="storeName">매장</option>
          <option value="mapName">구역</option>
          <option value="startTime">시작시간</option>
        </select>

        {sortKey && (
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 border rounded"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        )}
      </div>

      {/* ================= 데스크탑 테이블 (그대로) ================= */}
      <div className="hidden lg:block">
        {/* 필터 영역 */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6 ml-4">
          <div className="flex items-center gap-2">
            <span>조회일자</span>
            <div className="h-9 flex items-center">
              <DateRangePicker
                value={dateRangeInput}
                onChange={setDateRangeInput}
                fullWidth={false}
                size="small"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span>매장명</span>
            {roleLevel === 3 ? (
              <select
                value={selectedStoreIdInput}
                onChange={(e) => {
                  setSelectedStoreIdInput(Number(e.target.value));
                  setSelectedSnInput("");
                }}
                className="h-9 px-3 border border-gray-300 rounded bg-white text-sm flex items-center"
              >
                <option value={0}>전체</option>
                {allStores.map((store) => (
                  <option key={store.storeId} value={store.storeId}>
                    {store.shopName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={getStoreName(storeId || 0)}
                disabled
                className="h-9 px-3 border border-gray-200 rounded bg-gray-200 text-sm flex items-center"
              />
            )}

            <span>SN (별명)</span>
            <select
              value={selectedSnInput}
              onChange={(e) => setSelectedSnInput(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded bg-white text-sm flex items-center"
            >
              <option value="">전체</option>
              {filteredRobots.map((robot) => (
                <option key={robot.robotId} value={String(robot.sn)}>
                  {robot.sn}
                  {robot.nickname && ` (${robot.nickname})`}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="h-9 px-3 rounded flex items-center justify-center text-sm bg-[#333D51] text-white rounded hover:bg-slate-500"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleReset}
              className="h-9 px-3 rounded flex items-center justify-center text-sm border border-black text-black hover:bg-gray-100"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto rounded-xl shadow-xl bg-white text-nowrap">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center font-semibold">
                  No
                </th>
                <th
                  onClick={() => handleSort("sn")}
                  className="cursor-pointer px-4 py-2 text-center font-semibold"
                >
                  SN {renderSortIcon("sn")}
                </th>
                <th
                  onClick={() => handleSort("storeName")}
                  className="cursor-pointer px-4 py-2 text-center font-semibold"
                >
                  매장명 {renderSortIcon("storeName")}
                </th>
                <th
                  onClick={() => handleSort("mapName")}
                  className="cursor-pointer px-4 py-2 text-center font-semibold"
                >
                  구역 {renderSortIcon("mapName")}
                </th>
                <th
                  onClick={() => handleSort("startTime")}
                  className="cursor-pointer px-4 py-2 text-center font-semibold"
                >
                  시작시간 {renderSortIcon("startTime")}
                </th>
                <th className="px-4 py-2 text-center font-semibold">종료시간</th>
                <th className="px-4 py-2 text-center font-semibold">청소시간</th>
                <th className="px-4 py-2 text-center font-semibold">
                  청소면적(㎡)
                </th>
                <th className="px-4 py-2 text-center font-semibold">
                  전력소비(kwh)
                </th>
                <th className="px-4 py-2 text-center font-semibold">
                  물사용량(㎖)
                </th>
              </tr>
            </thead>
            <tbody>
              {ReportData.map((r, idx) => (
                <tr
                  key={r.reportId}
                  onClick={() => handleRowClick(r)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="px-4 py-4 text-center align-middle">{getRowIndex(idx)}</td>
                  <td className="px-4 py-4 text-center align-middle">{r.sn}</td>
                  <td className="px-4 py-4 text-center align-middle">
                    {getStoreName(r.storeId)}
                  </td>
                  <td className="px-4 py-4 text-center align-middle">{r.mapName}</td>
                  <td className="px-4 py-4 text-center align-middle">{r.startTime}</td>
                  <td className="px-4 py-4 text-center align-middle">{r.endTime}</td>
                  <td className="px-4 py-4 text-center align-middle">
                    {formatDynamicTime(r.cleanTime)}
                  </td>
                  <td className="px-4 py-4 text-center align-middle">{r.cleanArea ?? "-"}</td>
                  <td className="px-4 py-4 text-center align-middle">
                    {Math.round(r.costBattery * 1.3 * 100) / 10000}
                  </td>
                  <td className="px-4 py-4 text-center align-middle">{r.costWater}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 모바일 카드 리스트 ================= */}
      <div className="lg:hidden space-y-3">
        {ReportData.map((r, i) => (
          <MobileReportCard key={r.reportId} report={r} index={i} />
        ))}
      </div>


      {/* 페이지네이션 */}
      {ReportData.length > 0 && (
        <div className="mt-4 pb-6 ">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* 모달 */}
      <CleanReport
        open={modalOpen}
        onClose={handleModalClose}
        report={selectedReport}
        onUpdateRemark={(newRemark) => {
          setSelectedReport((prev) =>
            prev ? { ...prev, remark: newRemark } : prev
          );
          setReportData((prev) =>
            prev.map((r) =>
              r.puduReportId === selectedReport?.puduReportId
                ? { ...r, remark: newRemark }
                : r
            )
          );
        }}
      />
    </div>
  );
}
