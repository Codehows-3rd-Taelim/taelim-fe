import axios from "axios";
import type { AiReport, RawReport } from "../../type";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "../../store";

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
export const createAiReport = async (message: string) => {
  const token = localStorage.getItem("jwtToken");
  const res = await axios.post(
    `${BASE_URL}/ai/report`,
    { message },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.conversationId as string;
};

/**
 * 2단계 : SSE 구독 (표준 EventSource)
 */
export const subscribeAiReport = (
  conversationId: string,
  onNewReport: (report: AiReport) => void,
  onError: (err: any) => void
) => {
  const token = localStorage.getItem("jwtToken");

  const es = new EventSourcePolyfill(`${BASE_URL}/ai/report/stream/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  es.onmessage = (e) => {
    if (!e.data || e.data === "[DONE]") return;
    try {
      const parsed = JSON.parse(e.data);
      if (parsed.type === "savedReport") {
        onNewReport(parsed.data);
        es.close();
      } else if (parsed.type === "error") {
        onError(parsed.data);
        es.close();
      }
    } catch (err) {
      console.error("SSE 데이터 파싱 실패", err);
    }
  };

  es.onerror = (err) => {
    onError(err);
    es.close();
  };

  return es;
};