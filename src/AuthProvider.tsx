import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) return;

    let es: EventSource | null = null;
    let retryTimer: number | null = null;

    const connect = () => {
      es = createNotificationEventSource();
      if (!es) return;

      es.addEventListener("AI_CHAT_DONE", (e: MessageEvent) => {
        setToastMessage("AI 챗봇 답변이 도착했습니다");
        setToastOpen(true);
      });

      es.addEventListener("AI_REPORT_DONE", (e: MessageEvent) => {
        setToastMessage("AI 보고서 생성이 완료되었습니다");
        setToastOpen(true);
      });

      es.addEventListener("AI_REPORT_FAILED", (e: MessageEvent) => {
        const data = JSON.parse(e.data);

        setToastMessage(data.message ?? "AI 보고서 생성에 실패했습니다.");
        setToastOpen(true);
      });

      // heartbeat는 그냥 소비
      es.addEventListener("PING", () => {});

      es.onerror = () => {
        es?.close();
        es = null;

        // 3초 후 재연결
        retryTimer = window.setTimeout(connect, 3000);
      };
    };

    // 최초 연결
    connect();

    return () => {
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
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
