import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAuthStore } from "./store";
import {
  createNotificationEventSource,
  fetchUndeliveredNotifications,
  markNotificationDelivered,
  type Notification,
} from "./notificationApi";

/* ===============================
   AuthProvider (STEP 1)
================================ */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.jwtToken);

  // 토스트 상태
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 현재 표시 중인 알림
  const currentNotification = useRef<Notification | null>(null);

  // 중복 토스트 방지
  const shownNotificationIds = useRef<Set<number>>(new Set());

  // SSE ref
  const esRef = useRef<EventSource | null>(null);

  /* ===============================
     알림 pull & 토스트 표시
  ================================ */
  const pullUndelivered = async () => {
    const list = await fetchUndeliveredNotifications();
    if (!list.length) return;

    // 아직 안 보여준 것 중 첫 번째
    const next = list.find(
      (n) => !shownNotificationIds.current.has(n.notificationId)
    );
    if (!next) return;

    shownNotificationIds.current.add(next.notificationId);
    currentNotification.current = next;

    setToastMessage(next.message);
    setToastOpen(true);

    // 5초 후 delivered 처리
    setTimeout(() => {
      markNotificationDelivered(next.notificationId);
    }, 5000);
  };

  /* ===============================
     SSE 연결
  ================================ */
  useEffect(() => {
    if (!token) return;

    const es = createNotificationEventSource();
    esRef.current = es;

    // SSE는 신호만
    es?.addEventListener("NOTIFICATION", pullUndelivered);

    // 로그인 직후 보정 pull
    pullUndelivered();

    return () => {
      es?.close();
      esRef.current = null;
    };
  }, [token]);

  /* ===============================
     UI
  ================================ */
  return (
    <>
      {children}

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setToastOpen(false)}
          sx={{ cursor: "pointer" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
