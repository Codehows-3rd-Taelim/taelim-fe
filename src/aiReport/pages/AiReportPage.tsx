import React, { useEffect, useState, useMemo, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";
import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import type { AiReport } from "../../type";
// import ReportContent from "../components/ReportContent";
import { getAiReport, getRawReport, createAiReport, subscribeAiReport } from "../api/AiReportApi";
import AiReportDetail from "../components/AiReportDetail";

type LoadingReport = AiReport & { rawReport: "loading" };
type ReportWithLoading = AiReport | LoadingReport;

function isLoadingReport(report: ReportWithLoading): report is LoadingReport {
  return report.rawReport === "loading";
}

export default function AiReportPage() {
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([null, null]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [aiReportData, setAiReportData] = useState<ReportWithLoading[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [startDate, endDate] = dateRange;

  // 초기 보고서 로드
  useEffect(() => {
    getAiReport()
      .then(setAiReportData)
      .catch(() => setError("보고서 목록 로드 실패"));
  }, []);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);


  // 보고서 생성
  const handleGenerateReport = async () => {
    const query = queryRef.current?.value.trim();
    if (!query) {
      setError("질문 내용을 입력해주세요.");
      return;
    }

    const conversationId = crypto.randomUUID();

    setIsLoading(true);
    setError(null);

    // 임시 보고서
    const tempReport: LoadingReport = {
      aiReportId: -Date.now(),
      conversationId,
      rawMessage: query,
      rawReport: "loading",
      startTime: "",
      endTime: "",
      createdAt: new Date().toISOString(),
      userId: -1,
      name: "생성중...",
    };

    setAiReportData(prev => [tempReport, ...prev]);
    setOpenRow(tempReport.aiReportId);
    setPage(1);

    try {
      // 1. SSE 먼저 연결
      eventSourceRef.current = subscribeAiReport(
        conversationId,
        async (savedReport) => {
          try {
            const reports = await getAiReport();
            const target = reports.find(
              r => r.conversationId === savedReport.conversationId
            );

            if (target) {
              const raw = await getRawReport(target.aiReportId);
              const completed = { ...target, rawReport: raw };

              setAiReportData(prev => {
                const filtered = prev.filter(
                  r => r.conversationId !== conversationId
                );
                return [completed, ...filtered];
              });

              setOpenRow(target.aiReportId);
            }
          } finally {
            // 무조건 실행
            setIsLoading(false);
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
          }
        },
        (msg) => {
          setError(msg);
          setAiReportData(prev =>
            prev.filter(r => r.conversationId !== conversationId)
          );
          setIsLoading(false);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        }
      );

      // 2️. 그 다음 POST
      await createAiReport(conversationId, query);

      if (queryRef.current) queryRef.current.value = "";

    } catch (e) {
      setError("보고서 생성 요청 실패");
      setIsLoading(false);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
  };

  // 상세 클릭
  const handleRowClick = async (report: ReportWithLoading) => {
    if (openRow === report.aiReportId) {
      setOpenRow(null);
      return;
    }
    if (isLoadingReport(report)) return;

    if (!report.rawReport) {
      try {
        const content = await getRawReport(report.aiReportId);
        setAiReportData((prev) =>
          prev.map((r) =>
            r.aiReportId === report.aiReportId ? { ...r, rawReport: content } : r
          )
        );
      } catch {
        setError("상세 보고서 로드 실패");
      }
    }
    setOpenRow(report.aiReportId);
  };

  // 필터링 & 페이징
  const filteredReports = useMemo(() => {
    console.log("🔍 filteredReports 계산 시작, aiReportData:", aiReportData.length, "개");
    
    const filtered = aiReportData.filter((r) => {
      // 로딩 중인 임시 보고서는 필터링 없이 통과
      if (isLoadingReport(r)) {
        console.log("🔍 임시 보고서 발견:", r.aiReportId);
        return true;
      }
      
      const matchText = !searchText || r.rawMessage.includes(searchText);
      const matchPeriod =
        startDate && endDate
          ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
          : true;
      return matchText && matchPeriod;
    });
    
    console.log("🔍 필터링 후:", filtered.length, "개");
    
    const sorted = filtered.sort((a, b) => {
      // 임시 보고서(음수 ID)는 항상 맨 위로
      if (a.aiReportId < 0) return -1;
      if (b.aiReportId < 0) return 1;
      
      // 나머지는 생성일자 기준 내림차순
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
    
    console.log("🔍 정렬 후:", sorted.length, "개, 첫번째:", sorted[0]?.aiReportId);
    return sorted;
  }, [aiReportData, searchText, startDate, endDate]);

  const paginatedReports = useMemo(() => {
    const perPage = 20;
    const start = (page - 1) * perPage;
    const result = filteredReports.slice(start, start + perPage);
    console.log("📊 paginatedReports:", result.length, "개", result.map(r => ({
      id: r.aiReportId, 
      message: r.rawMessage.substring(0, 20),
      isLoading: isLoadingReport(r)
    })));
    return result;
  }, [filteredReports, page]);

  const totalPages = Math.ceil(filteredReports.length / 20);

  return (
    <div className="w-full min-h-screen px-6 py-4 bg-[#f7f7f7]">
      {/* {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg font-bold">
          {error}
        </div>
      )} */}

      <div className="bg-white p-6 mb-6 rounded-lg shadow flex gap-4">
        <textarea
          ref={queryRef}
          placeholder="조회하고 싶은 보고서 내용을 입력해 주세요."
          className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
          disabled={isLoading}
        />
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed h-[78px] min-w-[100px]"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>생성 중</span>
            </div>
          ) : (
            "조회"
          )}
        </button>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-4 ml-4 mb-4">
        <div className="flex items-center gap-4">
          <span>생성일자</span>
          <DateRangePicker
            value={dateRangeInput}
            onChange={setDateRangeInput}
          />
        </div>
        <div className="flex items-center gap-4">
          <span>내용</span>
          <input
            type="text"
            value={searchTextInput}
            onChange={(e) => setSearchTextInput(e.target.value)}
            className="w-[500px] px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              setSearchText(searchTextInput);
              setDateRange(dateRangeInput);
              setPage(1);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => {
              setSearchText("");
              setDateRange([null, null]);
              setSearchTextInput("");
              setDateRangeInput([null, null]);
              setPage(1);
            }}
            className="px-4 py-2 border border-black text-black rounded hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 보고서 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              {paginatedReports.map((r) => (
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
                      {r.endTime ? dayjs(r.endTime).format("YYYY-MM-DD") : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {dayjs(r.createdAt).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{r.name}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRowClick(r)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors disabled:cursor-not-allowed"
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
                          <AiReportDetail report={r} />
                          {/* {isLoadingReport(r) ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <Loader2
                                className="animate-spin text-orange-500"
                                size={48}
                              />
                              <p className="text-lg text-gray-600 font-medium">
                                보고서 생성중...
                              </p>
                              <p className="text-sm text-gray-500">
                                잠시만 기다려주세요
                              </p>
                            </div>
                          ) : (
                            <ReportContent markdown={r.rawReport} />
                          )} */}
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}