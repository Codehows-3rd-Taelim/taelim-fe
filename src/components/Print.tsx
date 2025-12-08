import type { RefObject } from "react";

export const handlePrint = (printRef: RefObject<HTMLDivElement | null>) => {
  if (!printRef.current) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
    return;
  }

  const printContent = printRef.current.innerHTML;

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
          
          body {
            font-family: 'Malgun Gothic', sans-serif;
            padding: 20px;
            background: white;
          }
          
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto 20px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            img {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
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
};