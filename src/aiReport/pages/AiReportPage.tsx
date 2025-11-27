import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import SearchIcon from "@mui/icons-material/Search";

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
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";

export default function AiReportPage() {
  const [reports] = useState([
    {
      id: 22,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 21,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 20,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 19,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 18,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 17,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 16,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 15,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 14,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 13,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 12,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 11,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 10,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 9,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 8,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 7,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 6,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 5,
      title: "오늘 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-16",
      periodEnd: "2025-11-16",
      createdAt: "2025-11-16",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 4,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 3,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 2,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
    {
      id: 1,
      title: "이번 주 청소 성과 분석 보고서 만들어줘.",
      periodStart: "2025-11-17",
      periodEnd: "2025-11-21",
      createdAt: "2025-11-21",
      writer: "홍길동",
      details: "보고서 상세 내용 예시입니다...",
    },
  ]);
  /** 🔍 검색 입력용 State (검색 버튼 누르기 전까지 반영 안 됨) */
  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);

  /** 🔍 실제 검색에 사용되는 State */
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);

  const [openRow, setOpenRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [startDate, endDate] = dateRange;

  /** 필터링 */
  const filteredReports = reports.filter((r) => {
    const matchText = r.title.includes(searchText);
    const matchPeriod =
      startDate && endDate
        ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
        : true;
    return matchText && matchPeriod;
  });

  /** 페이지네이션 */
  const reportsPerPage = 20;
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const startIndex = (page - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

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
      {/* 검색 영역 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <TextField
              placeholder={`조회하고 싶은 보고서 내용을 입력해 주세요.\n원하는 기간 등을 입력하면 더욱 자세한 보고서가 조회됩니다.`}
              multiline
              sx={{ width: 900 }}
            />
            <Button variant="contained" color="warning" sx={{ ml: 1, p: 3.4 }}>
              조회
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 검색 UI */}
      <Box display="flex" alignItems="center" gap={2} sx={{ ml: 4 }}>
        {/* 생성일자 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            fullWidth={false}
            size="small"
          />
        </Box>

        {/* 내용 입력 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>내용</span>
          <TextField
            value={searchTextInput}
            onChange={(e) => setSearchTextInput(e.target.value)}
            sx={{ width: 500, backgroundColor: "white" }}
            variant="outlined"
            size="small"
          />

          {/* 🔍 눌러야만 검색 적용됨 */}
          <IconButton
            sx={{ mr: 3, mb: 3, mt: 3 }}
            onClick={() => {
              setSearchText(searchTextInput);
              setDateRange(dateRangeInput);
              setPage(1);
            }}
          >
            <SearchIcon />
          </IconButton>

          <Button
            variant="outlined"
            sx={{ borderColor: "black", fontWeight: "bold", color: "black" }}
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
          maxHeight: 790,
          overflowY: "auto",
          mt: 3,
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
              <React.Fragment key={r.id}>
                <TableRow>
                  <TableCell align="center">{r.id}</TableCell>
                  <TableCell align="left">{r.title}</TableCell>
                  <TableCell align="center">
                    {r.periodStart} ~ {r.periodEnd}
                  </TableCell>
                  <TableCell align="center">{r.createdAt}</TableCell>
                  <TableCell align="center">{r.writer}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => setOpenRow(openRow === r.id ? null : r.id)}
                    >
                      {openRow === r.id ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={openRow === r.id} timeout="auto">
                      <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
                        <Typography variant="body2" color="text.secondary">
                          {r.details}
                        </Typography>
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
