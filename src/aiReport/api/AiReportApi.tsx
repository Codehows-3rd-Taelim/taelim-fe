import axios from "axios";
import type { AiReport, RawReport } from "../../type";

const BASE_URL = import.meta.env.VITE_API_URL;

//리포트 전체 가져오기 rawReport제외
export const getAiReport = async (): Promise<AiReport[]> => {
  const response = await axios.get(`${BASE_URL}/ai/Report`);
  return response.data;
};

//rawReport 가져오기
export const getRawReport = async (reportId: number): Promise<string> => {
  const response = await axios.get<RawReport>(
    `${BASE_URL}/ai/Report/${reportId}/rawReport`
  ); // 💡 객체에서 rawReport 필드의 문자열을 추출하여 반환
  return response.data.rawReport;
};

/**
 * Fetch API를 사용하여 Authorization 헤더를 포함한 SSE 스트림을 처리합니다.
 */
//스트림으로 토큰을 받아오려면 이렇게 하드코딩 해줘야 한다
export const postAiReport = async (
  query: string,
  conversationId: string,
  handlers: {
    onReportInfo: (data: string) => void;
    onMessage: (token: string) => void;
    onSavedReport: (data: AiReport) => void;
    onDone: () => void;
    onError: (error: Error) => void;
  }
) => {
  const accessToken = localStorage.getItem("jwtToken");

  if (!accessToken) {
    handlers.onError(
      new Error("인증 토큰(jwtToken)이 없습니다. 로그인 상태를 확인해 주세요.")
    );
    return;
  }

  const params = new URLSearchParams({
    message: query,
    conversationId: conversationId,
  });
  const url = `${BASE_URL}/ai/Report/sse?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      handlers.onError(
        new Error(
          `API 요청 실패: ${response.status} ${response.statusText}. ${errorText}`
        )
      );
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const message of messages) {
        if (message.trim() === "") continue;

        let eventName = "message";
        let data = "";

        const lines = message.split("\n");
        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.substring(6).trim();
          } else if (line.startsWith("data:")) {
            data += line.substring(5).trim();
          }
        }
        switch (eventName) {
          case "reportInfo":
            handlers.onReportInfo(data);
            break;
          case "message":
            if (data && data !== "[DONE]") {
              handlers.onMessage(data);
            }
            break;
          case "savedReport":
            try {
              handlers.onSavedReport(JSON.parse(data) as AiReport);
            } catch (e) {
              handlers.onError(
                new Error(
                  `savedReport JSON 파싱 오류: ${
                    e instanceof Error ? e.message : String(e)
                  }`
                )
              );
            }
            break;
          case "done":
            handlers.onDone();
            return;
        }
      }
    }
  } catch (error) {
    handlers.onError(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Fetch API 기반에서는 스트림 종료 후 추가적인 close 처리는 필요 없음 (reader.read가 done=true로 종료됨)
  }
};
