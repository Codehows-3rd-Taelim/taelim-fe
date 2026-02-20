import axios from "axios";
import type { AxiosResponse } from "axios";
import type { PaginationResponse, Report } from "../../type";
import { endpoints } from "../../api/endpoints";

export interface ReportQueryParams {
  page?: number;
  size?: number;
  storeId?: number; // 권한 기준 및 검색 조건
  sn?: string;
  startDate?: string;
  endDate?: string;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export const getReports = async (
  params: ReportQueryParams
): Promise<PaginationResponse<Report>> => {
  const response = await axios.post<PaginationResponse<Report>>(endpoints.reports.search, params);
  return response.data;
};

export const getReportsForDashboard = async (
  params: ReportQueryParams,
  signal?: AbortSignal
): Promise<Report[]> => {
  const response = await axios.get<Report[]>(endpoints.reports.base, { params, signal });
  return response.data;
};

// 특이사항
export const updateReportRemark = async (
  reportId: number,
  remark: string
): Promise<AxiosResponse<Report>> => {
  return axios.put(endpoints.reports.remark(reportId), { remark });
};