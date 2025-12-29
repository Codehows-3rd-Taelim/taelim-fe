import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Report } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface ReportQueryParams {
  page?: number;
  size?: number;
  storeId?: number; // 권한 기준
  filterStoreId?: number; // 검색 조건
  sn?: string;
  startDate?: string;
  endDate?: string;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
}

export const getReports = async (
  params: ReportQueryParams
): Promise<PageResponse<Report> | Report[]> => {
  const response = await axios.get(`${BASE_URL}/report`, {
    params,
  });
  return response.data;
};

// 특이사항
export const updateReportRemark = async (
  reportId: number,
  remark: string
): Promise<AxiosResponse<Report>> => {
  return axios.put(`/api/report/${reportId}/remark`, { remark });
};