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
        sortOrder,
      };

      const res = await getReports(params);
      setReportData(res.content);
      setTotalPages(res.totalPages ?? 0);
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
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
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

  return (
    <div className="w-full h-full max-w-[1400px] mx-auto pt-4 px-4 lg:px-6 space-y-6 bg-gray-100">
      {/* 검색 UI */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-4 ml-4">
        <div className="flex items-center gap-2">
          <span>조회일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            fullWidth={false}
            size="small"
          />
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
              className="px-2 py-1 border border-gray-300 rounded bg-white"
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
              className="px-2 py-1 border border-gray-200 rounded bg-gray-200"
            />
          )}

          <span>SN (별명)</span>
          <select
            value={selectedSnInput}
            onChange={(e) => setSelectedSnInput(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded bg-white"
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
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1 font-bold border border-black rounded text-black hover:bg-gray-100"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl shadow-xl bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
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
            {ReportData.map((r) => (
              <tr
                key={r.reportId}
                onClick={() => handleRowClick(r)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="px-4 py-2 text-center">{r.sn}</td>
                <td className="px-4 py-2 text-center">
                  {getStoreName(r.storeId)}
                </td>
                <td className="px-4 py-2 text-center">{r.mapName}</td>
                <td className="px-4 py-2 text-center">{r.startTime}</td>
                <td className="px-4 py-2 text-center">{r.endTime}</td>
                <td className="px-4 py-2 text-center">
                  {formatDynamicTime(r.cleanTime)}
                </td>
                <td className="px-4 py-2 text-center">{r.cleanArea ?? "-"}</td>
                <td className="px-4 py-2 text-center">
                  {Math.round(r.costBattery * 1.3 * 100) / 10000}
                </td>
                <td className="px-4 py-2 text-center">{r.costWater}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
