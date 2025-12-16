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

import { ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";

import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";

import type { AiReport } from "../../type";
import ReportContent from "../components/ReportContent";
import { getAiReport, getRawReport, createAiReport, subscribeAiReport } from "../api/AiReportApi";

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
    <div className="w-full min-h-screen px-6 py-4 bg-[#f7f7f7]">
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-white rounded-lg">
          <div className="font-bold">오류: {error}</div>
        </div>
      )}

      <div className="bg-white p-6 mb-6 rounded-lg shadow">
        <div className="flex gap-4">
          <textarea
            placeholder="조회하고 싶은 보고서 내용을 입력해 주세요.
원하는 기간 등을 입력하면 더욱 자세한 보고서가 조회됩니다."
            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed h-[78px]"
            onClick={handleGenerateReport}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "생성 중…" : "조회"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
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
            className="px-4 py-2 border border-black text-black rounded hover:bg-gray-50 transition-colors"
            onClick={() => {
              setSearchText("");
              setDateRange([null, null]);
              setSearchTextInput("");
              setDateRangeInput([null, null]);
              setPage(1);
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">no</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">질문 내용</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">보고서 기간</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">생성일자</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">작성자</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((r) => (
                <React.Fragment key={r.aiReportId}>
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm">
                      {r.aiReportId === -1 ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500 mx-auto" />
                      ) : (
                        r.aiReportId
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.rawMessage}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {dayjs(r.startTime).format("YYYY-MM-DD")} ~{" "}
                      {dayjs(r.endTime).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {dayjs(r.createdAt).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{r.name}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRowClick(r)}
                        disabled={r.aiReportId === -1 && !r.streamingRawReport}
                        className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          openRow === r.aiReportId ? "max-h-[2000px]" : "max-h-0"
                        }`}
                      >
                        <div className="p-6 bg-[#fafafa]">
                          <ReportContent
                            markdown={
                              r.streamingRawReport || r.rawReport || "로딩 중..."
                            }
                          />
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}