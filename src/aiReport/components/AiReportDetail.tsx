import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import ReportContent from "../components/ReportContent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ReportWithLoading } from "../pages/AiReportPage";

interface AiReportDetailProps {
  report: ReportWithLoading;
}

export default function AiReportDetail({ report }: AiReportDetailProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (!printWindow) return alert("팝업 차단됨");
      printWindow.document.write(`<html><head><title>보고서</title></head><body style="display:flex;justify-content:center;padding:20px;background:white;"><img src="${imgData}" style="width:70%;height:auto;" /></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    } catch (error) {
      console.error(error);
      alert("프린트 실패");
    }
  };

  const handlePdfDownload = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
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
      pdf.save("report.pdf");
    } catch (error) {
      console.error(error);
      alert("PDF 변환 실패");
    }
  };

  return (
    <div className="border rounded shadow mb-4 bg-gray-50 overflow-hidden">
      <div className="flex justify-end gap-2 p-4 bg-white border-b">
        <button onClick={handlePrint} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">프린트</button>
        <button onClick={handlePdfDownload} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">PDF 다운로드</button>
      </div>
      <div ref={printRef} className="p-6 bg-white">
        {report.rawReport === "loading" ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <p className="text-lg text-gray-600 font-medium">보고서 생성중...</p>
          </div>
        ) : (
          <ReportContent markdown={report.rawReport || "로딩 중..."} />
        )}
      </div>
    </div>
  );
}
