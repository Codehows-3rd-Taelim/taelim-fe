import { fetchWithAuth } from "../../store";
import { endpoints } from "../../api/endpoints";
import type { AiReport, RawReport } from "../../type";

export const getAiReport = async (): Promise<AiReport[]> => {
  const res = await fetchWithAuth(endpoints.ai.reports);
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
};

export const getRawReport = async (reportId: number): Promise<string> => {
  const res = await fetchWithAuth(endpoints.ai.reportRaw(reportId));
  if (!res.ok) throw new Error("Failed to load report");
  const data: RawReport = await res.json();
  return data.rawReport;
};

export const deleteAiReport = async (reportId: number) => {
  await fetchWithAuth(endpoints.ai.reportById(reportId), { method: "DELETE" });
};

// POST → SSE 스트림 직접 반환
export async function createReportStream(
  conversationId: string,
  message: string,
  signal?: AbortSignal
): Promise<Response> {
  const queryParams = new URLSearchParams({
    conversationId,
  });

  const res = await fetchWithAuth(
    `${endpoints.ai.reports}?${queryParams}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal,
    }
  );
  if (!res.ok || !res.body) throw new Error("보고서 생성 요청 실패");
  return res;
}
