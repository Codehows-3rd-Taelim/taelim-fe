import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
dayjs.extend(isBetween);

import {
  Box,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";

import type { DateRange } from "@mui/x-date-pickers-pro/models";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import CleanReport from "./CleanReport";
import type { Report, Robot } from "../../type";
import { useAuthStore } from "../../store";
import useOperationManagement from "../../operationManagement/hook/useOperationManagement";
import { getRobots } from "../../robot/api/RobotApi";
import { getReports } from "../api/ReportApi";

type SortKey = "sn" | "storeName" | "mapName";
type SortOrder = "asc" | "desc";

export default function ReportPage() {
  const { roleLevel, storeId } = useAuthStore();
  const { getStoreName, allStores } = useOperationManagement();

  // 모달 관련 State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // 검색 입력용 State
  const [selectedSnInput, setSelectedSnInput] = useState("");
  const [selectedStoreIdInput, setSelectedStoreIdInput] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );

  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);

  // 실제 검색에 사용되는 State
  const [selectedSn, setSelectedSn] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );

  const [ReportData, setReportData] = useState<Report[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [page, setPage] = useState(1);

  // 정렬 상태
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [totalPages, setTotalPages] = useState(0);
  // 날짜 범위가 변경될 때마다 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      const start = dateRangeInput[0] ?? dayjs().subtract(10, "year");
      const end = dateRangeInput[1] ?? dayjs();

      try {
        const targetStoreId =
          roleLevel === 3 ? undefined : storeId || undefined;

        const res = await getReports({
          page: page - 1,
          size: 20,
          storeId: targetStoreId,
          filterStoreId: selectedStoreId === 0 ? undefined : selectedStoreId,
          sn: selectedSn || undefined,
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
          sortKey: sortKey || undefined,
          sortOrder,
        });

        if ("content" in res) {
          setReportData(res.content);
          setTotalPages(res.totalPages ?? 0);
        } else {
          // 페이징 없는 응답 (혹시 쓸 경우 대비)
          setReportData(res);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("보고서 데이터 불러오기 실패", err);
      }
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

  // Robot 목록 로드
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

  useEffect(() => {
    if (!selectedSnInput) return;

    const robot = robots.find((r) => String(r.sn) === selectedSnInput);

    if (robot && roleLevel === 3) {
      setTimeout(() => setSelectedStoreIdInput(robot.storeId), 0);
    }
  }, [selectedSnInput, robots, roleLevel]);

  const formatDynamicTime = (cleanTimeSeconds: number) => {
    const totalSeconds = Math.floor(cleanTimeSeconds);
    if (totalSeconds === 0) return "-";

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${totalMinutes}분 ${seconds}초`;
    } else {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    }
  };

  // 정렬 핸들러
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  // 검색 버튼 핸들러
  const handleSearch = () => {
    setSelectedSn(selectedSnInput);
    setSelectedStoreId(selectedStoreIdInput);
    setPage(1);
  };

  // 초기화 버튼 핸들러
  const handleReset = () => {
    setDateRangeInput([null, null]);
    setSelectedSnInput("");
    setSelectedSn("");

    const defaultStoreId = roleLevel === 3 ? 0 : storeId || 0;
    setSelectedStoreIdInput(defaultStoreId);
    setSelectedStoreId(defaultStoreId);
    setPage(1);
  };

  // 로우 클릭 핸들러
  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  // 선택된 매장 기준으로 SN 필터링
  const filteredRobots =
    selectedStoreIdInput === 0
      ? robots
      : robots.filter((r) => r.storeId === selectedStoreIdInput);

  return (
    <Box
      sx={{
        width: "100%",
        flex: 1,
        px: 6,
        py: 6,
        bgcolor: "#f7f7f7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 검색 UI */}
      <Box display="flex" alignItems="center" gap={2} sx={{ ml: 4 }}>
        {/* 조회일자 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>조회일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            fullWidth={false}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* 매장 필터 */}
          <span>매장명</span>
          {roleLevel === 3 ? (
            <Select
              value={selectedStoreIdInput}
              onChange={(e) => {
                setSelectedStoreIdInput(Number(e.target.value));
                setSelectedSnInput("");
              }}
              displayEmpty
              size="small"
              sx={{ width: 200, backgroundColor: "white" }}
            >
              <MenuItem value={0}>전체</MenuItem>
              {allStores.map((store) => (
                <MenuItem key={store.storeId} value={store.storeId}>
                  {store.shopName}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <TextField
              value={getStoreName(storeId || 0)}
              disabled
              size="small"
              sx={{ width: 200, backgroundColor: "#f0f0f0" }}
            />
          )}

          {/* SN 필터 */}
          <span>SN (별명)</span>
          <Select
            value={selectedSnInput}
            onChange={(e) => setSelectedSnInput(e.target.value)}
            displayEmpty
            size="small"
            sx={{ width: 200, backgroundColor: "white" }}
          >
            <MenuItem value="">전체</MenuItem>
            {filteredRobots.map((robot) => (
              <MenuItem key={robot.robotId} value={String(robot.sn)}>
                {robot.sn}
                {robot.nickname && ` (${robot.nickname})`}
              </MenuItem>
            ))}
          </Select>

          {/* 검색 버튼 */}
          <IconButton onClick={handleSearch}>
            <SearchIcon />
          </IconButton>

          {/* 초기화 버튼 */}
          <Button
            variant="outlined"
            sx={{ borderColor: "black", fontWeight: "bold", color: "black" }}
            onClick={handleReset}
          >
            초기화
          </Button>
        </Box>
      </Box>

      {/* 보고서 테이블 */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          maxHeight: "auto",
          overflowY: "auto",
          mt: 3,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                onClick={() => handleSort("sn")}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                SN {renderSortIcon("sn")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("storeName")}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                매장명 {renderSortIcon("storeName")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleSort("mapName")}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                구역 {renderSortIcon("mapName")}
              </TableCell>
              <TableCell align="center">시작시간</TableCell>
              <TableCell align="center">종료시간</TableCell>
              <TableCell align="center">청소시간</TableCell>
              <TableCell align="center">청소면적(㎡)</TableCell>
              <TableCell align="center">전력소비(kwh)</TableCell>
              <TableCell align="center">물사용량(㎖)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {ReportData.map((r) => (
              <TableRow
                key={r.reportId}
                onClick={() => handleRowClick(r)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                <TableCell align="center">{r.sn}</TableCell>
                <TableCell align="center">{getStoreName(r.storeId)}</TableCell>
                <TableCell align="center">{r.mapName}</TableCell>
                <TableCell align="center">{r.startTime}</TableCell>
                <TableCell align="center">{r.endTime}</TableCell>
                <TableCell align="center">
                  {formatDynamicTime(r.cleanTime)}
                </TableCell>
                <TableCell align="center">
                  {r.cleanArea == null ? "-" : r.cleanArea}
                </TableCell>
                <TableCell align="center">
                  {Math.round(r.costBattery * 1.3 * 100) / 10000}
                </TableCell>
                <TableCell align="center">{r.costWater}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {ReportData.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* 청소 보고서 모달 */}
      <CleanReport
        open={modalOpen}
        onClose={handleModalClose}
        report={selectedReport}
        onUpdateRemark={(newRemark) => {
          // 선택된 report 갱신
          setSelectedReport(prev =>
            prev ? { ...prev, remark: newRemark } : prev
          );

          // 테이블 데이터 갱신
          setReportData(prev =>
            prev.map(r =>
              r.puduReportId === selectedReport?.puduReportId
                ? { ...r, remark: newRemark }
                : r
            )
          );
        }}
      />
    </Box>
  );
}
