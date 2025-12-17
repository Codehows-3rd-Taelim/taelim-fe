import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";

import type { AiReport } from "../../type";
import ReportContent from "../components/ReportContent";
import { getAiReport, getRawReport, createAiReport, subscribeAiReport } from "../api/AiReportApi";
import { fetchUndeliveredNotifications } from "../../notificationApi";

interface StreamingReport extends AiReport {
  streamingRawReport?: string;
}

export default function AiReportPage() {
  const [query, setQuery] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [aiReportData, setAiReportData] = useState<StreamingReport[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamingBufferRef = useRef<string>("");
  const streamingUpdateTimerRef = useRef<number | null>(null);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getAiReport();
        setAiReportData(data);
      } catch (e) {
        console.error("보고서 목록 로드 오류:", e);
        setError("보고서 목록을 불러오는 데 실패했습니다.");
      }
    }
    loadReports();
  }, []);

  const updateStreamingReport = useCallback(() => {
    if (streamingBufferRef.current) {
      setAiReportData((prevReports) => {
        const streamingReport = prevReports.find((r) => r.aiReportId === -1);
        if (!streamingReport) return prevReports;

        return prevReports.map((r) =>
          r.aiReportId === -1
            ? { ...r, streamingRawReport: streamingBufferRef.current }
            : r
        );
      });
    }
  }, []);

  const handleGenerateReport = async () => {
    if (!query.trim()) return;

    setError(null);
    setIsLoading(true);
    streamingBufferRef.current = "";

    // 🔹 임시 스트리밍 보고서 먼저 추가
    setAiReportData((prev) => [
      {
        aiReportId: -1,
        conversationId: 0,
        startTime: dayjs().toISOString(),
        endTime: dayjs().toISOString(),
        createdAt: dayjs().toISOString(),
        rawMessage: query,
        rawReport: "",
        userId: 0,
        name: "나",
        streamingRawReport: "",
      },
      ...prev,
    ]);
    setOpenRow(-1);

    try {
      // 1단계: 보고서 생성 요청 (POST)
      const conversationId = await createAiReport(query);

      // ✅ 2단계: SSE 구독
      subscribeAiReport(conversationId, {
        onMessage: (token: string) => {
          streamingBufferRef.current += token;

          if (streamingUpdateTimerRef.current) {
            clearTimeout(streamingUpdateTimerRef.current);
          }

          streamingUpdateTimerRef.current = window.setTimeout(() => {
            updateStreamingReport();
          }, 100);
        },

        onSavedReport: (savedReport: AiReport) => {
          if (streamingUpdateTimerRef.current) {
            clearTimeout(streamingUpdateTimerRef.current);
          }

          setAiReportData((prevReports) => [
            {
              ...savedReport,
              rawReport:
                savedReport.rawReport || streamingBufferRef.current,
            },
            ...prevReports.filter((r) => r.aiReportId !== -1),
          ]);

          streamingBufferRef.current = "";
          setOpenRow(savedReport.aiReportId);
        },

        onDone: () => {
          setIsLoading(false);
          setQuery("");
          setPage(1);

          setAiReportData((prevReports) =>
            prevReports.filter((r) => r.aiReportId !== -1)
          );

          // 보고서 완료 후 pull (1번)
          setTimeout(() => {
            fetchUndeliveredNotifications();
          }, 300); // 3초
        },

        onError: (e) => {
          console.error("SSE 오류:", e);
          setError("보고서 생성 중 오류가 발생했습니다.");
          setIsLoading(false);

          setAiReportData((prevReports) =>
            prevReports.filter((r) => r.aiReportId !== -1)
          );
        },
      });
    } catch (err) {
      console.error("보고서 생성 시작 실패:", err);
      setError("보고서 생성 요청에 실패했습니다.");
      setIsLoading(false);
    }
  };

  const handleRowClick = async (report: AiReport | StreamingReport) => {
    const reportId = report.aiReportId;

    if (openRow === reportId) {
      setOpenRow(null);
      return;
    }

    if (reportId === -1) {
      setOpenRow(reportId);
      return;
    }

    if (!report.rawReport) {
      setOpenRow(reportId);

      try {
        const contentData: string = await getRawReport(reportId);
        setAiReportData((prevData) =>
          prevData.map((r) =>
            r.aiReportId === reportId ? { ...r, rawReport: contentData } : r
          )
        );
      } catch (error) {
        console.error("상세 보고서 조회 오류:", error);
        setOpenRow(null);
        setError("상세 보고서를 불러오는 데 실패했습니다.");
        return;
      }
    }

    setOpenRow(reportId);
  };

  // 🔥 핵심 최적화 3: 필터링과 정렬을 useMemo로 메모이제이션
  const filteredReports = useMemo(() => {
    const filtered = aiReportData.filter((r) => {
      if (r.aiReportId === -1) return true;

      const matchText = searchText === "" || r.rawMessage.includes(searchText);
      const matchPeriod =
        startDate && endDate
          ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
          : true;

      return matchText && matchPeriod;
    });

    // 정렬
    filtered.sort((a, b) => {
      if (a.aiReportId === -1) return -1;
      if (b.aiReportId === -1) return 1;
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });

    return filtered;
  }, [aiReportData, searchText, startDate, endDate]);

  // 🔥 핵심 최적화 4: 페이지네이션도 useMemo로
  const paginatedReports = useMemo(() => {
    const reportsPerPage = 20;
    const startIndex = (page - 1) * reportsPerPage;
    return filteredReports.slice(startIndex, startIndex + reportsPerPage);
  }, [filteredReports, page]);

  const totalPages = Math.ceil(filteredReports.length / 20);

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
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "error.light", color: "white" }}>
          <Box fontWeight="bold">오류: {error}</Box>
        </Paper>
      )}

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
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "생성 중…" : "조회"}
          </Button>
        </Box>
      </Paper>

      <Box display="flex" alignItems="center" gap={2} sx={{ ml: 4 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            size="small"
          />
        </Box>

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
            sx={{ color: "black", borderColor: "black" }}
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

      <TableContainer component={Paper} sx={{ borderRadius: 3, mt: 3 }}>
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
                  <TableCell align="center">
                    {r.aiReportId === -1 ? (
                      <CircularProgress size={16} color="warning" />
                    ) : (
                      r.aiReportId
                    )}
                  </TableCell>
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
                    <IconButton
                      onClick={() => handleRowClick(r)}
                      disabled={r.aiReportId === -1 && !r.streamingRawReport}
                    >
                      {openRow === r.aiReportId ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={openRow === r.aiReportId}>
                      <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
                        <ReportContent
                          markdown={
                            r.streamingRawReport || r.rawReport || "로딩 중..."
                          }
                        />
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </Box>
  );
}
