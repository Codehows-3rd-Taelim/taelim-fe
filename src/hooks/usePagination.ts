import { useState, useCallback } from "react";

export interface UsePaginationReturn {
  page: number;         // 1-based (항상)
  totalPages: number;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  resetPage: () => void;                                        // → setPage(1)
  adjustAfterDelete: (remainingCount: number, pageSize: number) => void; // 삭제 후 페이지 보정
}

export function usePagination(initialPage = 1): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const resetPage = useCallback(() => setPage(1), []);

  const adjustAfterDelete = useCallback(
    (remainingCount: number, pageSize: number) => {
      const lastPage = Math.max(1, Math.ceil(remainingCount / pageSize));
      setPage((prev) => (prev > lastPage ? lastPage : prev));
    },
    []
  );

  return { page, totalPages, setPage, setTotalPages, resetPage, adjustAfterDelete };
}
