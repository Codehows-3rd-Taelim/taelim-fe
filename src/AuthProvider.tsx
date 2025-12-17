import { useEffect, useRef, useState } from "react";
import { Alert } from "@mui/material";
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
  const [toastSeverity, setToastSeverity] = useState<"info" | "success" | "error">("info");

  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;

    let es: EventSource | null = null;
    let retryTimer: number | null = null;

    const showToast = (
      message: string,
      severity: "info" | "success" | "error" = "info"
    ) => {
      setToastMessage(message);
      setToastSeverity(severity);
      setToastOpen(true);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = window.setTimeout(() => {
        setToastOpen(false);
        toastTimerRef.current = null;
      }, 5000);
    };

    const connect = () => {
      es = createNotificationEventSource();
      if (!es) return;

      es.addEventListener("AI_CHAT_DONE", () => {
        showToast("AI 챗봇 답변이 도착했습니다", "info");
      });

      es.addEventListener("AI_REPORT_DONE", () => {
        showToast("AI 보고서 생성이 완료되었습니다", "success");
      });

      es.addEventListener("AI_REPORT_FAILED", (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        showToast(
          data.message ?? "AI 보고서 생성에 실패했습니다.", "error");
      });

      es.addEventListener("PING", () => {});

      es.onerror = () => {
        es?.close();
        es = null;
        retryTimer = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [token]);

  return (
    <>
      {children}

      {toastOpen && (
        <div className="fixed top-6 right-6 z-50 -translate-x-1/2 animate-slide-down">
          <Alert
            severity={toastSeverity}
            variant="filled"
            className="!min-w-[420px] !text-base !py-3 !px-6 shadow-xl"
          >
            {toastMessage}
          </Alert>
        </div>
      )}
    </>
  );
}
