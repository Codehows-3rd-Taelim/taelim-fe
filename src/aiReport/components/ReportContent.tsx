import ReactMarkdown from "react-markdown";
import { Box } from "@mui/material";
import remarkGfm from "remark-gfm"; // 테이블, 취소선 등 일반적인 마크다운 확장 기능 지원

interface ReportContentProps {
  markdown: string;
}

export default function ReportContent({ markdown }: ReportContentProps) {
  // Markdown 내부의 HTML 요소에 Material-UI 스타일을 적용하기 위한 Wrapper
  return (
    <Box
      sx={{
        p: 2, // 내부 패딩

        // 폰트 스타일 및 기본 텍스트
        "& p": { mb: 1.5, fontSize: "0.95rem", lineHeight: 1.6 },
        "& strong": { fontWeight: 700, color: "#333" },

        // 헤딩 스타일 (H2, H3)
        "& h2": {
          mt: 3,
          mb: 1.5,
          borderBottom: "2px solid #ddd",
          pb: 0.5,
          fontSize: "1.5rem",
          color: "#1976d2", // Mui Primary Color
        },
        "& h3": {
          mt: 2,
          mb: 1,
          color: "#333",
          fontSize: "1.2rem",
          borderLeft: "4px solid #ff9800", // Mui Warning Color (강조)
          pl: 1,
        },

        // 목록 스타일
        "& ul": { ml: 3, my: 1.5, listStyleType: "disc" },
        "& ol": { ml: 3, my: 1.5 },

        // 표(Table) 스타일 적용 (가장 중요)
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          margin: "16px 0",
          borderRadius: "4px",
          overflow: "hidden",
        },
        "& th, & td": {
          border: "1px solid #e0e0e0",
          padding: "10px 15px",
          textAlign: "left",
          fontSize: "0.9rem",
        },
        "& th": {
          backgroundColor: "#f0f0f0",
          fontWeight: "bold",
          color: "#555",
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </Box>
  );
}
