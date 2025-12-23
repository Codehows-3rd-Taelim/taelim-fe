import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import ReportContent from "../components/ReportContent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { AiReport } from "../../type";
import { deleteAiReport } from "../api/AiReportApi";

type LoadingReport = AiReport & { rawReport: "loading" };
type ReportWithLoading = AiReport | LoadingReport;

interface AiReportDetailProps {
  report: ReportWithLoading;
  onDeleted?: (reportId: number) => void;
}

export default function AiReportDetail({ report, onDeleted }: AiReportDetailProps) {
  const isLoading = report.rawReport === "loading";
  const printRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (!printWindow) return alert("팝업 차단됨");

      printWindow.document.write(`
        <html>
          <head><title>보고서</title></head>
          <body style="display:flex;justify-content:center;padding:20px;background:white;">
            <img src="${imgData}" style="width:70%;height:auto;" />
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (e) {
      console.error(e);
      alert("프린트 실패");
    }
  };

  const handlePdfDownload = async () => {
    if (!printRef.current) return;

    try {
        const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        }

        const start = formatDate(report.startTime);
        const end = formatDate(report.endTime);

        pdf.save(`${start}_${end}_청소보고서.pdf`);
    } catch (e) {
        console.error(e);
        alert("PDF 변환 실패");
    }
    };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-lg font-medium text-gray-700">
          보고서 생성 중입니다. 잠시만 기다려 주세요.
        </p>
        <p className="text-sm text-gray-500">
          최대 5분 정도 소요될 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          프린트
        </button>
        <button
          onClick={handlePdfDownload}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          PDF 다운로드
        </button>
        <button
          onClick={async () => {
            if (!window.confirm("해당 보고서를 삭제하시겠습니까?")) return;

            try {
              await deleteAiReport(report.aiReportId);
              alert("삭제되었습니다.");
              onDeleted?.(report.aiReportId);
            } catch {
              alert("삭제 실패");
            }
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          삭제
        </button>
      </div>

      {/* AI 보고서 */}
      <div ref={printRef}>
        <ReportContent markdown={report.rawReport} />
      </div>
    </>
  );
}
