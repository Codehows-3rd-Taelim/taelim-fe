import React, { useEffect, useState, useMemo, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { ChevronDown, ChevronUp, Search, Loader2, X } from "lucide-react";
import type { DateRange } from "@mui/x-date-pickers-pro";
import DateRangePicker from "../../components/DateRangePicker";
import Pagination from "../../components/Pagination";
import type { AiReport } from "../../type";
import {
  getAiReport,
  getRawReport,
  createAiReport,
  subscribeAiReport,
} from "../api/AiReportApi";
import AiReportDetail from "./AiReportDetail";

type LoadingReport = AiReport & { rawReport: "loading" };
type ReportWithLoading = AiReport | LoadingReport;

function isLoadingReport(report: ReportWithLoading): report is LoadingReport {
  return report.rawReport === "loading";
}

export default function AiReportPage() {
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [aiReportData, setAiReportData] = useState<ReportWithLoading[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());

  const [startDate, endDate] = dateRange;

  const shouldAutoOpenRef = useRef(false);

  // ------------------ localStorage 관련 ------------------
  const savePendingReport = (report: LoadingReport) => {
    const pending = JSON.parse(localStorage.getItem("pendingReports") || "[]");
    pending.unshift({
      aiReportId: report.aiReportId,
      conversationId: report.conversationId,
      rawMessage: report.rawMessage,
      createdAt: report.createdAt,
    });
    localStorage.setItem("pendingReports", JSON.stringify(pending));
  };

  const clearPendingReport = (conversationId: string) => {
    const pending = JSON.parse(localStorage.getItem("pendingReports") || "[]");
    const filtered = pending.filter(
      (p: any) => p.conversationId !== conversationId
    );
    localStorage.setItem("pendingReports", JSON.stringify(filtered));
  };

  const restorePendingReports = () => {
    const pending = JSON.parse(localStorage.getItem("pendingReports") || "[]");
    if (pending.length === 0) return [];

    const restored: LoadingReport[] = pending.map((p: any) => ({
      ...p,
      rawReport: "loading",
      startTime: "",
      endTime: "",
      userId: -1,
      name: "생성중...",
    }));
    setAiReportData((prev) => [...restored, ...prev]);

    return restored;
  };

  // ------------------ 초기 데이터 로드 ------------------
  useEffect(() => {
    const restored = restorePendingReports();

    // 생성 중 보고서가 있었던 경우만 자동 오픈 허용
    if (restored.length > 0) {
      shouldAutoOpenRef.current = true;
    }
    // 서버 보고서 로드
    getAiReport()
      .then((reports) => {
        // 서버 상태를 진실로 사용
        setAiReportData(reports);

        // 서버에 이미 존재하는 conversationId 제거
        const serverConversationIds = new Set(
          reports.map((r) => r.conversationId)
        );

        const pending = JSON.parse(
          localStorage.getItem("pendingReports") || "[]"
        );

        const cleaned = pending.filter(
          (p: any) => !serverConversationIds.has(p.conversationId)
        );

        localStorage.setItem("pendingReports", JSON.stringify(cleaned));

        // 정리된 pending 기준으로만 SSE 재연결
        restored
          .filter((r) =>
            cleaned.some((p: any) => p.conversationId === r.conversationId)
          )
          .forEach((report) => {
            eventSourceRef.current = subscribeAiReport(
              report.conversationId,
              async () => {
                const latest = await getAiReport();
                setAiReportData(latest);
                clearPendingReport(report.conversationId);
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
              },
              (msg) => {
                clearPendingReport(report.conversationId);
                setError(msg || "보고서 생성 실패");
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
              }
            );
          });
      })
      .catch(() => setError("보고서 목록 로드 실패"));

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  // ------------------ 보고서 생성 ------------------
  const handleGenerateReport = async () => {
    const query = queryRef.current?.value.trim();
    if (!query) {
      setError("질문 내용을 입력해주세요.");
      return;
    }

    const conversationId = `report-${crypto.randomUUID()}`;
    setIsLoading(true);
    setError(null);

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

    setAiReportData((prev) => [tempReport, ...prev]);
    savePendingReport(tempReport);
    setOpenRow(tempReport.aiReportId);
    setPage(1);

    try {
      eventSourceRef.current = subscribeAiReport(
        conversationId,
        async () => {
          try {
            const reports = await getAiReport();

            // 기존 상태를 버리고 서버 상태로 완전 교체
            setAiReportData(reports);

            setOpenRow(reports[0]?.aiReportId ?? null);
          } finally {
            setIsLoading(false);
            clearPendingReport(conversationId);
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
          }
        },
        (msg) => {
          setAiReportData((prev) =>
            prev.filter((r) => r.conversationId !== conversationId)
          );
          clearPendingReport(conversationId);
          setError(msg || "보고서 생성 실패");
          setIsLoading(false);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        }
      );

      await createAiReport(conversationId, query);
      if (queryRef.current) queryRef.current.value = "";
    } catch (e) {
      setError("보고서 생성 요청 실패");
      setIsLoading(false);
      clearPendingReport(conversationId);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
  };

  // ------------------ 상세 보고서 열기 ------------------
  const handleRowClick = async (report: ReportWithLoading) => {
    if (openRow === report.aiReportId) {
      setOpenRow(null);
      return;
    }
    if (isLoadingReport(report)) return;

    setOpenRow(report.aiReportId);

    if (!report.rawReport) {
      try {
        const content = await getRawReport(report.aiReportId);
        setAiReportData((prev) =>
          prev.map((r) =>
            r.aiReportId === report.aiReportId
              ? { ...r, rawReport: content }
              : r
          )
        );
      } catch {
        setError("상세 보고서 로드 실패");
      }
    }
  };

  // ------------------ 필터 + 페이지네이션 ------------------
  const filteredReports = useMemo(() => {
    const filtered = aiReportData.filter((r) => {
      if (isLoadingReport(r)) return true;
      const matchText = !searchText || r.rawMessage.includes(searchText);
      const matchPeriod =
        startDate && endDate
          ? dayjs(r.createdAt).isBetween(startDate, endDate, null, "[]")
          : true;
      return matchText && matchPeriod;
    });
    return filtered.sort((a, b) => {
      if (a.aiReportId < 0) return -1;
      if (b.aiReportId < 0) return 1;
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
  }, [aiReportData, searchText, startDate, endDate]);

  const paginatedReports = useMemo(() => {
    const perPage = 20;
    const start = (page - 1) * perPage;
    return filteredReports.slice(start, start + perPage);
  }, [filteredReports, page]);

  const totalPages = Math.ceil(filteredReports.length / 20);

  const getReportNumber = (index: number) => {
    return filteredReports.length - ((page - 1) * 20 + index);
  };

  // ------------------ UI 렌더링 ------------------
  return (
    <div className="w-full h-full max-w-[1400px] mx-auto px-3 sm:px-6 py-4 bg-gray-100">
      {error && (
        <div className="relative p-3 sm:p-4 mb-4 bg-red-100 text-red-700 rounded-lg font-bold whitespace-pre-line text-sm pr-10">
          <button
            onClick={() => setError(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X size={18} />
          </button>
          {error}
        </div>
      )}

      {/* 보고서 생성 입력창 */}
      <div className="bg-white p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg shadow mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <textarea
            ref={queryRef}
            placeholder="생성하고 싶은 보고서의 기간을 입력해 주세요.
ex) 25년 11월 1일 ~ 25년 11월 15일 청소 보고서"
            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-[D3AC2B] text-sm sm:text-base"
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading) {
                  handleGenerateReport();
                }
              }
            }}
          />
          <button
            className="px-6 py-3 min-h-[50px] sm:min-h-[60px] bg-[#BA1E1E] text-white rounded font-medium hover:bg-[#1D313B] disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[100px]"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-nowrap">
                <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8" />
                <span>생성 중</span>
              </div>
            ) : (
              "생성"
            )}
          </button>
        </div>
      </div>

      {/* 필터 - 모바일/데스크톱 분기 */}
      <div className="mb-4">
        {/* 모바일: 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden relative w-full p-4 bg-white rounded-lg shadow mb-2 text-left"
        >
          <span className="font-medium">필터</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 mr-4">
            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        </button>

        {/* 필터 내용 */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } justify-center lg:flex lg:items-center gap-4 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow lg:shadow-none`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 lg:mb-1">
            <span className="text-ml font-medium">생성일자</span>
            <DateRangePicker
              value={dateRangeInput}
              onChange={setDateRangeInput}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 lg:mb-0 ml-1">
            <span className="text-ml font-medium">내용</span>
            <input
              type="text"
              ref={searchInputRef}
              className="w-full sm:w-[300px] lg:w-[500px] px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchText(searchInputRef.current?.value ?? "");
                setDateRange(dateRangeInput);
                setPage(1);
                setShowFilters(false);
              }}
              className="flex-1 sm:flex-none min-w-[56px] p-2 bg-[#333D51] text-white rounded hover:bg-slate-500 transition-colors mr-1"
            >
              <Search size={20} className="mx-auto" />
            </button>
            <button
              onClick={() => {
                setSearchText("");
                setDateRange([null, null]);
                setDateRangeInput([null, null]);
                if (searchInputRef.current) {
                  searchInputRef.current.value = "";
                }
                setPage(1);
                setShowFilters(false);
              }}
              className="flex-1 sm:flex-none min-w-[80px] px-1 py-1 bg-[#CBD0D8] text-black rounded hover:bg-slate-300 transition-colors text-ml"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 보고서 리스트 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 데스크톱: 테이블 */}
        <div className="hidden lg:block overflow-x-auto">
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
              {paginatedReports.map((r, index) => (
                <React.Fragment key={r.aiReportId}>
                  <tr
                    className={`border-b transition-colors text-center ${
                      isLoadingReport(r)
                        ? "cursor-not-allowed"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                    onMouseEnter={() => {
                      if (
                        !r.rawReport &&
                        !prefetchedRef.current.has(r.aiReportId)
                      ) {
                        prefetchedRef.current.add(r.aiReportId);
                        getRawReport(r.aiReportId)
                          .then((content) => {
                            setAiReportData((prev) =>
                              prev.map((item) =>
                                item.aiReportId === r.aiReportId
                                  ? { ...item, rawReport: content }
                                  : item
                              )
                            );
                          })
                          .catch(() => {});
                      }
                    }}
                    onClick={() => handleRowClick(r)}
                  >
                    <td className="px-4 py-3 text-center text-sm">
                      {isLoadingReport(r) ? "-" : getReportNumber(index)}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.rawMessage}</td>
                    <td className="px-4 py-3 text-center text-sm whitespace-nowrap">
                      {r.startTime
                        ? dayjs(r.startTime).format("YYYY-MM-DD")
                        : "-"}{" "}
                      ~{" "}
                      {r.endTime ? dayjs(r.endTime).format("YYYY-MM-DD") : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm whitespace-nowrap">
                      {dayjs(r.createdAt).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{r.name}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(r);
                        }}
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
                        className={`transition-all duration-300 ${
                          openRow === r.aiReportId ? "max-h-[70vh]" : "max-h-0"
                        } overflow-hidden`}
                      >
                        <div
                          className="p-6 bg-[#fafafa] overflow-y-auto"
                          style={{ maxHeight: "70vh" }}
                        >
                          <AiReportDetail
                            report={r}
                            onDeleted={(id) => {
                              setAiReportData((prev) =>
                                prev.filter((item) => item.aiReportId !== id)
                              );
                              setOpenRow(null);
                            }}
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

        {/* 모바일: 카드 리스트 */}
        <div className="lg:hidden">
          {paginatedReports.map((r, index) => (
            <div key={r.aiReportId} className="border-b last:border-b-0">
              <div
                className={`relative p-4 ${
                  isLoadingReport(r)
                    ? "cursor-not-allowed bg-gray-50"
                    : "cursor-pointer active:bg-gray-50"
                }`}
                onClick={() => handleRowClick(r)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">
                      #{isLoadingReport(r) ? "-" : getReportNumber(index)}
                    </div>
                    <div className="font-medium text-sm mb-2">
                      {r.rawMessage}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(r);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors disabled:cursor-not-allowed"
                    disabled={isLoadingReport(r)}
                  >
                    {openRow === r.aiReportId ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-500">보고서 기간:</span>
                  <span>
                    {r.startTime
                      ? dayjs(r.startTime).format("YYYY-MM-DD")
                      : "-"}{" "}
                    ~ {r.endTime ? dayjs(r.endTime).format("YYYY-MM-DD") : "-"}
                  </span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-gray-500">생성일자:</span>
                  <span>{dayjs(r.createdAt).format("YYYY-MM-DD")}</span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-gray-500">작성자:</span>
                  <span>{r.name}</span>
                </div>
              </div>

              <div
                className={`transition-all duration-300 ${
                  openRow === r.aiReportId ? "max-h-[70vh]" : "max-h-0"
                } overflow-hidden`}
              >
                <div
                  className="p-4 bg-[#fafafa] overflow-y-auto"
                  style={{ maxHeight: "70vh" }}
                >
                  <AiReportDetail
                    report={r}
                    onDeleted={(id) => {
                      setAiReportData((prev) =>
                        prev.filter((item) => item.aiReportId !== id)
                      );
                      setOpenRow(null);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
