import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko"; // 한국어 로케일 적용
import isBetween from "dayjs/plugin/isBetween"; // 날짜 범위 비교 플러그인
import SearchIcon from "@mui/icons-material/Search";
dayjs.extend(isBetween); // dayjs에 플러그인 확장

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

// AI 보고서 페이지 컴포넌트
export default function AiReportPage() {
  // 보고서 데이터 (예시용)
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

  // 테이블 행 확장 상태 (열린 행 ID 저장)
  const [openRow, setOpenRow] = useState<number | null>(null);
  // 현재 페이지 번호
  const [page, setPage] = useState(1);

  // 날짜 범위 구조 분해
  const [startDate, endDate] = dateRange;

  /** 필터링 로직 */
  const filteredReports = reports.filter((r) => {
    // 제목에 검색어 포함 여부
    const matchText = r.title.includes(searchText);
    // 생성일자가 선택한 기간 내에 있는지 확인
    const matchPeriod =
      startDate && endDate
        ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
        : true;
    return matchText && matchPeriod;
  });

  /** 페이지네이션 로직 */
  const reportsPerPage = 20; // 한 페이지에 보여줄 보고서 수
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage); // 총 페이지 수
  const startIndex = (page - 1) * reportsPerPage; // 현재 페이지 시작 인덱스
  const endIndex = startIndex + reportsPerPage; // 현재 페이지 끝 인덱스
  const paginatedReports = filteredReports.slice(startIndex, endIndex); // 현재 페이지에 보여줄 보고서 목록

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: 6,
        py: 4,
        bgcolor: "#f7f7f7", // 배경색
      }}
    >
      {/* 상단 검색 안내 영역 */}
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

      {/* 검색 UI (날짜 + 내용 입력 + 버튼) */}
      <Box display="flex" alignItems="center" gap={2} sx={{ ml: 4 }}>
        {/* 생성일자 필터 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            fullWidth={false}
            size="small"
          />
        </Box>

        {/* 내용 필터 */}
        <Box display="flex" alignItems="center" gap={2}>
          <span>내용</span>
          <TextField
            value={searchTextInput}
            onChange={(e) => setSearchTextInput(e.target.value)}
            sx={{ width: 500, backgroundColor: "white" }}
            variant="outlined"
            size="small"
          />

          {/* 🔍 검색 버튼 (눌러야만 검색 적용됨) */}
          <IconButton
            sx={{ mr: 3, mb: 3, mt: 3 }}
            onClick={() => {
              setSearchText(searchTextInput);
              setDateRange(dateRangeInput);
              setPage(1); // 검색 시 첫 페이지로 이동
            }}
          >
            <SearchIcon />
          </IconButton>

          {/* 초기화 버튼 */}
          <Button
            variant="outlined"
            sx={{ borderColor: "black", fontWeight: "bold", color: "black" }}
            onClick={() => {
              setSearchText("");
              setDateRange([null, null]);
              setSearchTextInput("");
              setDateRangeInput([null, null]);
              setPage(1); // 초기화 후 첫 페이지로 이동
            }}
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
                {/* 보고서 기본 정보 행 */}
                <TableRow>
                  <TableCell align="center">{r.id}</TableCell>
                  <TableCell align="left">{r.title}</TableCell>
                  <TableCell align="center">
                    {r.periodStart} ~ {r.periodEnd}
                  </TableCell>
                  <TableCell align="center">{r.createdAt}</TableCell>
                  <TableCell align="center">{r.writer}</TableCell>
                  <TableCell align="center">
                    {/* 상세 내용 토글 버튼 */}
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

                {/* 상세 내용 (Collapse로 토글) */}
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

      {/* 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </Box>
  );
}
