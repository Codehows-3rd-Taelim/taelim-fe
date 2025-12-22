import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAuthStore } from "./store";
import {
  createNotificationEventSource,
  fetchUndeliveredNotifications,
  markNotificationDelivered,
  type Notification,
} from "./notificationApi";

export default function AuthProvider({children,}: {children: React.ReactNode;}) {
  const token = useAuthStore((state) => state.jwtToken);

  // 토스트 메시지
  const [toastMessage, setToastMessage] = useState<string>("");

  // 현재 알림
  const currentNotification = useRef<Notification | null>(null);

  // 이미 표시한 알림 중복 방지
  const shownNotificationIds = useRef<Set<number>>(new Set());

  // SSE ref
  const esRef = useRef<EventSource | null>(null);

  // 알림 
  const pullUndelivered = async () => {
    const list = await fetchUndeliveredNotifications();
    if (!list.length) return;

    const next = list.find(
      (n) => !shownNotificationIds.current.has(n.notificationId)
    );
    if (!next) return;

    shownNotificationIds.current.add(next.notificationId);
    currentNotification.current = next;

    // 토스트 이벤트 
    setToastMessage(next.message);

    // delivered 처리
    markNotificationDelivered(next.notificationId);
  };


  // SSE 연결
  useEffect(() => {
    if (!token) return;

    const es = createNotificationEventSource();
    esRef.current = es;

    es?.addEventListener("NOTIFICATION", pullUndelivered);

    // 로그인 직후 보정
    pullUndelivered();

    return () => {
      es?.close();
      esRef.current = null;
    };
  }, [token]);


  return (
    <>
      {children}

      {toastMessage && (
        <Snackbar
          key={toastMessage}
          open
          autoHideDuration={5000}
          onClose={() => setToastMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            severity="info"
            variant="filled"
            onClose={() => setToastMessage("")}
            sx={{ cursor: "pointer" }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
