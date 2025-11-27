import { Box, Button } from "@mui/material";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // 한 화면에 보여줄 최대 버튼 수
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  maxButtons = 5,
}: PaginationProps) {
  const pageButtons = [];

  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  for (let i = start; i <= end; i++) {
    pageButtons.push(
      <Button
        variant={page === i ? "contained" : "outlined"}
        onClick={() => onPageChange(i)}
        sx={{
          minWidth: 36,
          color: page === i ? "white" : "black",
          borderColor: "black",
          bgcolor: page === i ? "black" : "transparent",
          "&:hover": {
            bgcolor: page === i ? "black" : "#f0f0f0",
            borderColor: "black", // hover 시 검은색 유지
          },
        }}
      >
        {i}
      </Button>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1 }}>
      {/* Prev */}
      <Button
        variant="outlined"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
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
        &lt;
      </Button>

      {pageButtons}

      {/* Next */}
      <Button
        variant="outlined"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
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
        &gt;
      </Button>
    </Box>
  );
}
