import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
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
  Collapse,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";

import { getAiReport, getRawReport, postAiReport } from "../api/AiReportApi";

import type { AiReport } from "../../type";
import ReportContent from "../components/ReportContent";

export default function AiReportPage() {
  const [query, setQuery] = useState("");

  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);

  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);

  const [AiReportData, setAiReportData] = useState<AiReport[]>([]);

  const [openRow, setOpenRow] = useState<number | null>(null);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const [startDate, endDate] = dateRange;

  // ---------------------------------------------
  // 최초 보고서 조회
  // ---------------------------------------------
  useEffect(() => {
    async function loadReports() {
      const data = await getAiReport();
      setAiReportData(data);
    }
    loadReports();
  }, []);

  // ---------------------------------------------
  // 보고서 생성 + SSE streaming
  // ---------------------------------------------
  const handleGenerateReport = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    const conversationId = crypto.randomUUID();
    //SSE 스트리밍은 DB 저장이 완료되기 전부터 응답을 받기 시작하니
    // 현재 진행중인 HTTP요청을 고유하게 식별가능하도록 랜덤으로 식별 ID만듦
    //
    try {
      // 1) 보고서 생성 요청
      await postAiReport(query, conversationId);
      // 2) 생성이 완료되면 전체 조회
      const list = await getAiReport();
      setAiReportData(list);
      // 3) 최신 보고서 자동 열기
      if (list.length > 0) {
        const latestReport = list[0];
        const latestReportId = latestReport.aiReportId;

        const contentData = await getRawReport(latestReportId);

        setAiReportData(
          (
            prevData // 1. 이전 상태(prevData)를 인수로 받아 새로운 상태를 계산합니다.
          ) =>
            prevData.map((r) => {
              // 2. 기존 배열(prevData)을 순회하며 새로운 배열을 생성합니다. (불변성 유지)

              // 3. 현재 순회 중인 보고서가 방금 생성된 최신 보고서인지 ID로 확인합니다.
              if (r.aiReportId === latestReportId) {
                // 4. 최신 보고서인 경우: 기존 객체를 복사하고(스프레드 문법: ...r),
                //    rawReport 필드만 새롭게 API에서 가져온 값으로 덮어씁니다.
                return {
                  ...r,
                  rawReport: contentData.rawReport,
                };
              } else {
                // 5. 최신 보고서가 아닌 나머지 보고서 객체들은 변경 없이 그대로 반환합니다.
                return r;
              }
            })
        );

        setOpenRow(latestReportId);
      }
    } catch (error) {
      console.error("보고서 생성 오류:", error);
    } finally {
      setIsLoading(false);
      setQuery("");
      setPage(1);
    }
  };

  const handleRowClick = async (report: AiReport) => {
    const reportId = report.aiReportId;

    if (openRow === reportId) {
      // 이미 열려있으면 닫기만 함
      setOpenRow(null);
      return;
    }

    // 💡 2. openRow 클릭 시 rawReport 조회 💡
    if (!report.rawReport) {
      // rawReport가 없는 경우에만 API 호출 (지연 로딩)
      try {
        const contentData = await getRawReport(reportId);

        // 조회된 rawReport를 해당 목록 데이터에 추가 (불변성 유지)
        setAiReportData((prevData) =>
          prevData.map((r) =>
            r.aiReportId === reportId
              ? { ...r, rawReport: contentData.rawReport }
              : r
          )
        );
      } catch (error) {
        console.error("상세 보고서 조회 오류:", error);
        // 오류 발생 시 열지 않고 리턴
        return;
      }
    }

    // 로드 완료 또는 이미 로드된 경우 행 열기
    setOpenRow(reportId);
  };

  // ---------------------------------------------
  // 필터링 (텍스트 + 기간)
  // ---------------------------------------------
  const filteredReports = AiReportData.filter((r) => {
    const matchText = searchText === "" || r.rawMessage.includes(searchText);

    const matchPeriod =
      startDate && endDate
        ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
        : true;

    return matchText && matchPeriod;
  });

  // ---------------------------------------------
  // 페이지네이션
  // ---------------------------------------------
  const reportsPerPage = 20;
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const startIndex = (page - 1) * reportsPerPage;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + reportsPerPage
  );

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
      {/* AI 리포트 생성 영역 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            placeholder={`조회하고 싶은 보고서 내용을 입력해 주세요.\n원하는 기간 등을 입력하면 더욱 자세한 보고서가 조회됩니다.`}
            multiline
            sx={{ width: "100%" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />

          <Button
            variant="contained"
            color="warning"
            sx={{ p: 3, height: 78 }}
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? "생성 중…" : "조회"}
          </Button>
        </Box>
      </Paper>

      {/* 검색 필터 */}
      <Box display="flex" alignItems="center" gap={2} sx={{ ml: 4 }}>
        {/* 기간 필터 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            size="small"
          />
        </Box>

        {/* 텍스트 검색 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>내용</span>
          <TextField
            value={searchTextInput}
            onChange={(e) => setSearchTextInput(e.target.value)}
            sx={{ width: 500, bgcolor: "white" }}
            size="small"
          />

          <IconButton
            onClick={() => {
              setSearchText(searchTextInput);
              setDateRange(dateRangeInput);
              setPage(1);
            }}
          >
            <SearchIcon />
          </IconButton>

          <Button
            sx={{
              color: "black",
              borderColor: "black",
              "&:hover": {
                borderColor: "black",
                bgcolor: "#f0f0f0",
              },
            }}
            variant="outlined"
            onClick={() => {
              setSearchText("");
              setDateRange([null, null]);
              setSearchTextInput("");
              setDateRangeInput([null, null]);
              setPage(1);
            }}
          >
            초기화
          </Button>
        </Box>
      </Box>

      {/* 테이블 */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          maxHeight: "auto", // 화면에 맞게 조절
          mt: 3,
          overflowY: "auto", // 전체 스크롤
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">no</TableCell>
              <TableCell align="center">질문 내용</TableCell>
              <TableCell align="center">보고서 기간</TableCell>
              <TableCell align="center">생성일자</TableCell>
              <TableCell align="center">작성자</TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.map((r) => (
              <React.Fragment key={r.aiReportId}>
                <TableRow>
                  <TableCell align="center">{r.aiReportId}</TableCell>
                  <TableCell>{r.rawMessage}</TableCell>
                  <TableCell align="center">
                    {dayjs(r.startTime).format("YYYY-MM-DD")} ~{" "}
                    {dayjs(r.endTime).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="center">
                    {dayjs(r.createdAt).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="center">{r.name}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleRowClick(r)}>
                      {openRow === r.aiReportId ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* 상세내용 */}
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={openRow === r.aiReportId}>
                      <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
                        <ReportContent markdown={r.rawReport} />
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
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
