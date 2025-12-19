import axios from "axios";
import type { AiReport, RawReport } from "../../type";
import { EventSourcePolyfill } from "event-source-polyfill";
// import { useAuthStore } from "../../store";

const BASE_URL = import.meta.env.VITE_API_URL;

//리포트 전체 가져오기 rawReport제외
export const getAiReport = async (): Promise<AiReport[]> => {
  const response = await axios.get(`${BASE_URL}/ai/report`);
  return response.data;
};

//rawReport 가져오기
export const getRawReport = async (reportId: number): Promise<string> => {
  const response = await axios.get<RawReport>(
    `${BASE_URL}/ai/report/${reportId}/rawReport`
  );
  return response.data.rawReport;
};

/**
 * 1단계 : 보고서 생성 요청 (POST)
 * → conversationId만 받음
 */
export const createAiReport = async (
  conversationId: string,
  message: string
) => {
  const token = localStorage.getItem("jwtToken");

  await axios.post(
    `${BASE_URL}/ai/report?conversationId=${conversationId}`,
    { message },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

/**
 * 2단계 : SSE 구독 (표준 EventSource)
 */
export const subscribeAiReport = (
  conversationId: string,
  onSaved: (report: AiReport) => void,
  onError: (message: string) => void
) => {
  const token = localStorage.getItem("jwtToken");

  const es = new EventSourcePolyfill(
    `${BASE_URL}/ai/report/stream/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  es.addEventListener("savedReport", (e: MessageEvent) => {
    onSaved(JSON.parse(e.data));
  });

  es.addEventListener("error", () => {
    onError("AI 보고서 생성 실패");
  });

  return es;
};