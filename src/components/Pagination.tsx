import { Box, Button } from "@mui/material";
import type { PaginationProps } from "../type";

// Pagination 컴포넌트 정의
export default function Pagination({
  page,          // 현재 페이지 번호
  totalPages,    // 전체 페이지 수
  onPageChange,  // 페이지 바뀔 때 호출할 함수
  maxButtons = 5 // 한 번에 보여줄 페이지 버튼 개수
}: PaginationProps) {
  const pageButtons = []; // 페이지 버튼들을 담을 배열

  // 시작 페이지 번호 계산 (현재 페이지 기준으로 버튼 중앙 배치)
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  // 끝 페이지 번호 계산
  let end = start + maxButtons - 1;

  // 끝 페이지가 전체 페이지 수를 넘어가면 조정
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  // start ~ end 범위의 페이지 버튼 생성
  for (let i = start; i <= end; i++) {
    pageButtons.push(
      <Button
        key={i}
        // 현재 페이지는 "contained"(채워진 버튼), 나머지는 "outlined"(테두리 버튼)
        variant={page === i ? "contained" : "outlined"}
        onClick={() => {
          if (page !== i) onPageChange(i);
        }}
        sx={{
          minWidth: 36, // 버튼 최소 너비
          color: page === i ? "white" : "black", // 현재 페이지는 흰 글씨
          borderColor: "black", // 테두리 색상
          bgcolor: page === i ? "black" : "transparent", // 현재 페이지는 검은 배경
          "&:hover": {
            bgcolor: page === i ? "black" : "#f0f0f0", // hover 시 색상 변경
            borderColor: "black", // hover 시 테두리 유지
          },
        }}
      >
        {i} {/* 버튼 안에 페이지 번호 표시 */}
      </Button>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1 }}>
      {/* Prev 버튼 (첫 페이지에서는 비활성화) */}
      <Button
        variant="outlined"
        disabled={page === 1} // 첫 페이지일 때 비활성화
        onClick={() => onPageChange(page - 1)} // 이전 페이지로 이동
        sx={{
          minWidth: 36,
          color: "black",
          borderColor: "black",
          "&:hover": {
            borderColor: "black",
            bgcolor: "#f0f0f0",
          },
        }}
      >
        &lt; {/* "<" 기호 */}
      </Button>

      {/* 페이지 번호 버튼들 */}
      {pageButtons}

      {/* Next 버튼 (마지막 페이지에서는 비활성화) */}
      <Button
        variant="outlined"
        disabled={page === totalPages} // 마지막 페이지일 때 비활성화
        onClick={() => onPageChange(page + 1)} // 다음 페이지로 이동
        sx={{
          minWidth: 36,
          color: "black",
          borderColor: "black",
          "&:hover": {
            borderColor: "black",
            bgcolor: "#f0f0f0",
          },
        }}
      >
        &gt; {/* ">" 기호 */}
      </Button>
    </Box>
  );
}
