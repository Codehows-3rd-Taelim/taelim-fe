import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAuthStore } from "./store";
import { createNotificationEventSource } from "./aichat/api/aiChatApi";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.jwtToken);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // EventSource retryTimer 관리 (
  const esRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 토큰 없으면 SSE 연결하지 않음
    if (!token) {
      esRef.current?.close();
      esRef.current = null;

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      return;
    }

    const connect = () => {
      // 재연결 시점에도 토큰 재확인
      if (!useAuthStore.getState().jwtToken) return;

      const es = createNotificationEventSource();
      if (!es) return;

      esRef.current = es;

      es.addEventListener("AI_CHAT_DONE", () => {
        setToastMessage("AI 챗봇 답변이 도착했습니다");
        setToastOpen(true);
      });

      es.addEventListener("AI_REPORT_DONE", () => {
        setToastMessage("AI 보고서 생성이 완료되었습니다");
        setToastOpen(true);
      });

      es.addEventListener("AI_REPORT_FAILED", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setToastMessage(data.message ?? "AI 보고서 생성에 실패했습니다.");
        } catch {
          setToastMessage("AI 보고서 생성에 실패했습니다.");
        }
        setToastOpen(true);
      });

      // heartbeat는 그냥 소비
      es.addEventListener("PING", () => {});

      es.onerror = () => {
        es.close();
        esRef.current = null;

        // 토큰 있을 때만 재연결
        if (useAuthStore.getState().jwtToken) {
          retryTimerRef.current = window.setTimeout(connect, 3000);
        }
      };
    };

    // 최초 연결
    connect();

    // cleanup
    return () => {
      esRef.current?.close();
      esRef.current = null;

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [token]);

  return (
    <>
      {children}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ ml: 2, mb: 2 }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
