import axios from "axios";
import type { AiReport, RawReport } from "../../type";

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.conversationId as string;
};

/**
 * 2단계 : SSE 구독 (표준 EventSource)
 */
export const subscribeAiReport = (
  conversationId: string,
  handlers: {
    onMessage: (token: string) => void;
    onSavedReport: (report: AiReport) => void;
    onDone: () => void;
    onError: (e: Event) => void;
  }
) => {
  const token = localStorage.getItem("jwtToken");

  const es = new EventSource(
    `${BASE_URL}/ai/report/stream/${conversationId}?token=${token}`
  );

  es.addEventListener("message", (e) => {
    handlers.onMessage(e.data);
  });

  es.addEventListener("savedReport", (e) => {
    handlers.onSavedReport(JSON.parse(e.data));
  });

  es.addEventListener("done", () => {
    handlers.onDone();
    es.close();
  });

  es.onerror = (e) => {
    handlers.onError(e);
    es.close();
  };

  return es;
};
