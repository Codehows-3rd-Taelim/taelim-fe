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
  const [searchTextInput, setSearchTextInput] = useState("");
  const [dateRangeInput, setDateRangeInput] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [aiReportData, setAiReportData] = useState<ReportWithLoading[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  // ------------------ localStorage로 openRow 복원 ------------------
  useEffect(() => {
    const savedOpenRow = localStorage.getItem("openRow");
    if (savedOpenRow) {
      setOpenRow(Number(savedOpenRow));
    }
  }, []);

  // ------------------ openRow 변경 시 localStorage 저장 ------------------
  useEffect(() => {
    if (openRow !== null) {
      localStorage.setItem("openRow", String(openRow));
    } else {
      localStorage.removeItem("openRow");
    }
  }, [openRow]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());

  const [startDate, endDate] = dateRange;

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

    // 항상 첫번째 임시 보고서를 상세페이지로 열어둠
    setOpenRow(restored[0]?.aiReportId ?? null);

    return restored;
  };

  // ------------------ 초기 데이터 로드 ------------------
  useEffect(() => {
    const restored = restorePendingReports();

    // 복원된 임시 보고서가 있으면 SSE 재연결
    restored.forEach((report) => {
      if (!isLoadingReport(report)) return;
      eventSourceRef.current = subscribeAiReport(
        report.conversationId,
        async () => {
          const reports = await getAiReport();

          // 무조건 전체 치환
          setAiReportData(reports);

          setOpenRow(reports[0]?.aiReportId ?? null);
          clearPendingReport(report.conversationId);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        },
        (msg) => {
          setAiReportData((prev) =>
            prev.filter((r) => r.conversationId !== report.conversationId)
          );
          clearPendingReport(report.conversationId);
          setError(msg || "보고서 생성 실패");
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        }
      );
    });

    // 서버 보고서 초기 로드
    getAiReport()
      .then((reports) => {
        setAiReportData((prev) => {
          const filtered = reports.filter(
            (r) => !prev.find((p) => p.aiReportId === r.aiReportId)
          );
          return [...prev, ...filtered];
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
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-4 bg-gray-100">
      {error && (
        <div className="p-3 sm:p-4 mb-4 bg-red-100 text-red-700 rounded-lg font-bold whitespace-pre-line text-sm">
          <button onClick={() => setError(null)} className="float-right">
            <X size={18} />
          </button>
          {error}
        </div>
      )}

      {/* 보고서 생성 입력창 */}
      <div className="bg-white p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <textarea
            ref={queryRef}
            placeholder="조회하고 싶은 보고서의 기간을 입력해 주세요.
ex) 25년 11월 1일 ~ 25년 11월 15일 청소 보고서"
            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
            rows={3}
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
            className="px-6 py-3 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed sm:h-[78px] sm:min-w-[100px]"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>생성 중</span>
              </div>
            ) : (
              "조회"
            )}
          </button>
        </div>
      </div>

      {/* 필터 - 모바일/데스크톱 분기 */}
      <div className="mb-4">
        {/* 모바일: 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-lg shadow mb-2"
        >
          <span className="font-medium">필터</span>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* 필터 내용 */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } justify-center lg:flex lg:items-center gap-4 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow lg:shadow-none`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 lg:mb-0">
            <span className="text-sm font-medium">생성일자</span>
            <DateRangePicker
              value={dateRangeInput}
              onChange={setDateRangeInput}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 lg:mb-0">
            <span className="text-sm font-medium">내용</span>
            <input
              type="text"
              value={searchTextInput}
              onChange={(e) => setSearchTextInput(e.target.value)}
              className="w-full sm:w-[300px] lg:w-[500px] px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchText(searchTextInput);
                setDateRange(dateRangeInput);
                setPage(1);
                setShowFilters(false);
              }}
              className="flex-1 sm:flex-none p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Search size={20} className="mx-auto" />
            </button>
            <button
              onClick={() => {
                setSearchText("");
                setDateRange([null, null]);
                setSearchTextInput("");
                setDateRangeInput([null, null]);
                setPage(1);
                setShowFilters(false);
              }}
              className="flex-1 sm:flex-none px-4 py-2 border border-black text-black rounded hover:bg-gray-50 transition-colors text-sm"
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
                    className={`border-b transition-colors ${
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
                className={`p-4 ${
                  isLoadingReport(r)
                    ? "cursor-not-allowed bg-gray-50"
                    : "cursor-pointer active:bg-gray-50"
                }`}
                onClick={() => handleRowClick(r)}
              >
                <div className="flex justify-between items-start mb-2">
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
                    className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors disabled:cursor-not-allowed"
                    disabled={isLoadingReport(r)}
                  >
                    {openRow === r.aiReportId ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">보고서 기간:</span>
                    <span>
                      {r.startTime
                        ? dayjs(r.startTime).format("YY-MM-DD")
                        : "-"}{" "}
                      ~ {r.endTime ? dayjs(r.endTime).format("YY-MM-DD") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">생성일자:</span>
                    <span>{dayjs(r.createdAt).format("YY-MM-DD HH:mm")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">작성자:</span>
                    <span>{r.name}</span>
                  </div>
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
