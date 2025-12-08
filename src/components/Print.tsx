import type { RefObject } from "react";
import html2canvas from "html2canvas";

export const handlePrint = async (printRef: RefObject<HTMLDivElement | null>) => {
  if (!printRef.current) return;

  try {
    // HTML을 캔버스로 변환
    const canvas = await html2canvas(printRef.current, {
      scale: 2, // 고해상도를 위해 scale 증가
      useCORS: true, // 외부 이미지 로드 허용
      logging: false,
      backgroundColor: "#ffffff",
    });

    // 캔버스를 이미지로 변환
    const imgData = canvas.toDataURL("image/png");

    // 프린트 창 열기
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
      return;
    }

    // 프린트 페이지 구성
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>청소 보고서</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              background: white;
              padding: 20px;
            }
            
            img {
              width: 33%;
              height: auto;
              display: block;
            }
            
            @media print {
              body {
                padding: 10mm;
              }
              
              img {
                page-break-inside: avoid;
                width: 70%;
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="청소 보고서" />
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // 이미지 로딩 대기 후 프린트
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } catch (error) {
    console.error("프린트 생성 실패:", error);
    alert("프린트 생성에 실패했습니다.");
  }
};