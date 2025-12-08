import React, { useEffect, useState } from "react";
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
import { getReport } from "../api/ReportApi";
import type { Report, Robot } from "../../type";
import { useAuthStore } from "../../store";
import useOperationManagement from "../../operationManagement/hook/useOperationManagement";
import { getRobots } from "../../robot/api/RobotApi";

type SortKey = "sn" | "storeName" | "mapName";
type SortOrder = "asc" | "desc";

export default function ReportPage() {
  const { roleLevel, storeId } = useAuthStore();
  const { getStoreName, allStores } = useOperationManagement();

  // 검색 입력용 State
  const [selectedSnInput, setSelectedSnInput] = useState("");
  const [selectedStoreIdInput, setSelectedStoreIdInput] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );
  
  // 디폴트 날짜 계산
  const getDefaultDateRange = (): DateRange<Dayjs> => [
    dayjs().subtract(3, "day"),
    dayjs(),
  ];

  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>(
    getDefaultDateRange()
  );

  // 실제 검색에 사용되는 State
  const [selectedSn, setSelectedSn] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(
    roleLevel === 3 ? 0 : storeId || 0
  );

  const [AiReportData, setAiReportData] = useState<Report[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [page, setPage] = useState(1);

  // 정렬 상태
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 날짜 범위가 변경될 때마다 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!dateRangeInput[0] || !dateRangeInput[1]) return;

      try {
        const targetStoreId = roleLevel === 3 ? undefined : storeId || undefined;
        const startDate = dateRangeInput[0].format("YYYY-MM-DD 00:00:00");
        const endDate = dateRangeInput[1].format("YYYY-MM-DD 23:59:59");
        
        const data = await getReport(targetStoreId, startDate, endDate);
        setAiReportData(data);
        setPage(1); // 날짜 변경 시 첫 페이지로 이동
      } catch (err) {
        console.error("보고서 데이터 불러오기 실패", err);
      }
    };
    loadData();
  }, [dateRangeInput, roleLevel, storeId]);

  // Robot 목록 로드 (storeId 기반)
  useEffect(() => {
    const loadRobots = async () => {
      try {
        const targetStoreId = roleLevel === 3 ? undefined : storeId || undefined;
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

    if (hours === 0) {
      return `${totalMinutes}분 ${seconds}초`;
    } else {
      return `${hours}시 ${minutes}분 ${seconds}초`;
    }
  };

  // 필터링 로직 (날짜는 API에서 처리되므로 SN과 매장만 필터링)
  const filteredReports = AiReportData.filter((r) => {
    // SN 필터
    const matchSn = selectedSn ? String(r.sn) === selectedSn : true;

    // 매장 필터
    const matchStore = selectedStoreId !== 0 ? r.storeId === selectedStoreId : true;

    return matchSn && matchStore;
  });

  // 정렬 로직
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortKey === "sn") {
      const compare = String(a.sn).localeCompare(String(b.sn));
      return sortOrder === "asc" ? compare : -compare;
    } else if (sortKey === "storeName") {
      const nameA = getStoreName(a.storeId);
      const nameB = getStoreName(b.storeId);
      const compare = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? compare : -compare;
    } else if (sortKey === "mapName") {
      // 한글 정렬 지원
      const compare = a.mapName.localeCompare(b.mapName, "ko");
      return sortOrder === "asc" ? compare : -compare;
    } else {
      // 기본 정렬: startTime 내림차순
      return dayjs(b.startTime).unix() - dayjs(a.startTime).unix();
    }
  });

  // 페이지네이션
  const reportsPerPage = 20;
  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);
  const startIndex = (page - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

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
    const defaultDate = getDefaultDateRange();
    setDateRangeInput(defaultDate);
    setSelectedSnInput("");
    setSelectedSn("");
    const defaultStoreId = roleLevel === 3 ? 0 : storeId || 0;
    setSelectedStoreIdInput(defaultStoreId);
    setSelectedStoreId(defaultStoreId);
    setPage(1);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: 6,
        py: 4,
        bgcolor: "#f7f7f7",
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
          {/* SN 필터 */}
          <span>SN</span>
          <Select
            value={selectedSnInput}
            onChange={(e) => setSelectedSnInput(e.target.value)}
            displayEmpty
            size="small"
            sx={{ width: 200, backgroundColor: "white" }}
          >
            <MenuItem value="">전체</MenuItem>
            {robots.map((robot) => (
              <MenuItem key={robot.robotId} value={String(robot.sn)}>
                {robot.sn}
              </MenuItem>
            ))}
          </Select>

          {/* 매장 필터 */}
          <span>매장명</span>
          {roleLevel === 3 ? (
            <Select
              value={selectedStoreIdInput}
              onChange={(e) => setSelectedStoreIdInput(Number(e.target.value))}
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
          maxHeight: 790,
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
            {paginatedReports.map((r) => (
              <TableRow key={r.reportId}>
                <TableCell align="center">{r.sn}</TableCell>
                <TableCell align="center">{getStoreName(r.storeId)}</TableCell>
                <TableCell align="center">{r.mapName}</TableCell>
                <TableCell align="center">{r.startTime}</TableCell>
                <TableCell align="center">{r.endTime}</TableCell>
                <TableCell align="center">
                  {formatDynamicTime(r.cleanTime)}
                </TableCell>
                <TableCell align="center">{r.cleanArea}</TableCell>
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
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </Box>
  );
}