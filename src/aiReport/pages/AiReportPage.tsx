import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";

import { ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";

import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";

import type { AiReport } from "../../type";
import ReportContent from "../components/ReportContent";
import {
  getAiReportPage,
  getRawReport,
  createAiReport,
  subscribeAiReport,
} from "../api/AiReportApi";

// 로딩 중인 임시 보고서 타입
type LoadingReport = AiReport & {
  rawReport: "loading";
};

// 일반 보고서 또는 로딩 보고서
type ReportWithLoading = AiReport | LoadingReport;

// 타입 가드: 로딩 중인 보고서인지 확인
function isLoadingReport(report: ReportWithLoading): report is LoadingReport {
  return report.rawReport === "loading";
}

export default function AiReportPage() {
  const queryRef = React.useRef<HTMLTextAreaElement>(null);
  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [aiReportData, setAiReportData] = useState<ReportWithLoading[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, endDate] = dateRange;

  // 보고서 목록 로드
  const loadReports = async (currentPage: number) => {
    setIsFetching(true);
    try {
      const startDateStr = startDate
        ? startDate.format("YYYY-MM-DD")
        : undefined;
      const endDateStr = endDate ? endDate.format("YYYY-MM-DD") : undefined;

      const response = await getAiReportPage(
        currentPage - 1, // 백엔드가 0-based인 경우
        20,
        searchText || undefined,
        startDateStr,
        endDateStr
      );

      setAiReportData(response.content);
      setTotalPages(response.totalPages);
    } catch (e) {
      console.error("보고서 목록 로드 오류:", e);
      setError("보고서 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsFetching(false);
    }
  };

  // 초기 로드 및 필터/페이지 변경시 로드
  useEffect(() => {
    loadReports(page);
  }, [page, searchText, startDate, endDate]);

  // 보고서 생성
  const handleGenerateReport = async () => {
    const query = queryRef.current?.value.trim() || "";
    if (!query) return;

    setError(null);
    setIsLoading(true);

    // 임시 로딩 보고서를 목록 상단에 추가
    const tempReportId = -Date.now(); // 임시 ID (음수로 구분)
    const tempReport: LoadingReport = {
      aiReportId: tempReportId,
      conversationId: 0,
      rawMessage: query,
      startTime: "",
      endTime: "",
      createdAt: new Date().toISOString(),
      name: "생성 중...",
      rawReport: "loading",
      userId: 0,
    };

    setAiReportData((prev) => [tempReport, ...prev]);
    setOpenRow(tempReportId); // 자동으로 펼치기

    // 1. POST로 생성 요청
    let conversationId: string;
    try {
      conversationId = await createAiReport(query);
    } catch (err) {
      console.error("보고서 생성 요청 실패", err);
      setError("보고서 생성 요청에 실패했습니다.");
      setIsLoading(false);
      // 임시 보고서 제거
      setAiReportData((prev) =>
        prev.filter((r) => r.aiReportId !== tempReportId)
      );
      setOpenRow(null);
      return;
    }

    // 2. SSE 구독
    subscribeAiReport(
      conversationId,
      async (newReport: AiReport) => {
        try {
          // rawReport가 없으면 fetch
          if (!newReport.rawReport) {
            const contentData = await getRawReport(newReport.aiReportId);
            newReport.rawReport = contentData;
          }

          // 임시 보고서를 실제 보고서로 교체
          setAiReportData((prev) =>
            prev.map((r) => (r.aiReportId === tempReportId ? newReport : r))
          );
          setOpenRow(newReport.aiReportId); // 실제 ID로 업데이트

          // 입력창 초기화
          if (queryRef.current) {
            queryRef.current.value = "";
          }

          setIsLoading(false); // 버튼 활성화
          setError(null);

          // 목록 새로고침 (새 보고서가 정확한 위치에 표시되도록)
          loadReports(1);
          setPage(1);
        } catch (err) {
          console.error("상세 보고서 로드 실패", err);
          setError("보고서 로드 실패");
          setIsLoading(false);
          // 임시 보고서 제거
          setAiReportData((prev) =>
            prev.filter((r) => r.aiReportId !== tempReportId)
          );
          setOpenRow(null);
        }
      },
      (err: Error) => {
        console.error("SSE 오류", err);
        setError("보고서 생성 중 오류가 발생했습니다.");
        setIsLoading(false);
        // 임시 보고서 제거
        setAiReportData((prev) =>
          prev.filter((r) => r.aiReportId !== tempReportId)
        );
        setOpenRow(null);
      }
    );
  };

  const handleRowClick = async (report: ReportWithLoading) => {
    const reportId = report.aiReportId;

    if (openRow === reportId) {
      setOpenRow(null);
      return;
    }

    // 로딩 중인 보고서는 클릭해도 아무 동작 안 함
    if (isLoadingReport(report)) {
      return;
    }

    if (!report.rawReport) {
      try {
        const contentData = await getRawReport(reportId);
        setAiReportData((prevData) =>
          prevData.map((r) =>
            r.aiReportId === reportId ? { ...r, rawReport: contentData } : r
          )
        );
      } catch (error) {
        console.error("상세 보고서 조회 오류:", error);
        setError("상세 보고서를 불러오는 데 실패했습니다.");
        return;
      }
    }

    setOpenRow(reportId);
  };

  const handleSearch = () => {
    setSearchText(searchTextInput);
    setDateRange(dateRangeInput);
    setPage(1); // 검색 시 첫 페이지로
  };

  const handleReset = () => {
    setSearchText("");
    setDateRange([null, null]);
    setSearchTextInput("");
    setDateRangeInput([null, null]);
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen px-6 py-4 bg-[#f7f7f7]">
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          <div className="font-bold">오류: {error}</div>
        </div>
      )}

      <div className="bg-white p-6 mb-6 rounded-lg shadow">
        <div className="flex gap-4">
          <textarea
            ref={queryRef}
            placeholder="조회하고 싶은 보고서 내용을 입력해 주세요."
            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed h-[78px]"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? "생성 중…" : "조회"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4 mb-4">
        <div className="flex items-center gap-4">
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
            size="small"
          />
        </div>

        <div className="flex items-center gap-4">
          <span>내용</span>
          <input
            type="text"
            value={searchTextInput}
            onChange={(e) => setSearchTextInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-[500px] px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isFetching}
          >
            <Search size={20} />
          </button>
          <button
            className="px-4 py-2 border border-black text-black rounded hover:bg-gray-50 transition-colors"
            onClick={handleReset}
            disabled={isFetching}
          >
            초기화
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isFetching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                  no
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                  질문 내용
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                  보고서 기간
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                  생성일자
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                  작성자
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {aiReportData.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    조회된 보고서가 없습니다.
                  </td>
                </tr>
              ) : (
                aiReportData.map((r) => (
                  <React.Fragment key={r.aiReportId}>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-sm">
                        {r.aiReportId > 0 ? r.aiReportId : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{r.rawMessage}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {r.startTime
                          ? dayjs(r.startTime).format("YYYY-MM-DD")
                          : "-"}{" "}
                        ~{" "}
                        {r.endTime
                          ? dayjs(r.endTime).format("YYYY-MM-DD")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {dayjs(r.createdAt).format("YYYY-MM-DD")}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRowClick(r)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={isLoadingReport(r)}
                        >
                          {openRow === r.aiReportId ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={6} className="p-0">
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            openRow === r.aiReportId
                              ? "max-h-[2000px]"
                              : "max-h-0"
                          }`}
                        >
                          <div className="p-6 bg-[#fafafa]">
                            {isLoadingReport(r) ? (
                              <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2
                                  className="animate-spin text-orange-500"
                                  size={48}
                                />
                                <p className="text-lg text-gray-600 font-medium">
                                  보고서 생성중...
                                </p>
                              </div>
                            ) : (
                              <ReportContent
                                markdown={r.rawReport || "로딩 중..."}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage: number) => setPage(newPage)}
        />
      )}
    </div>
  );
}
