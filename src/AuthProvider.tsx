import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAuthStore } from "./store";
import { createNotificationEventSource, fetchUnreadNotifications, markNotificationAsRead, type Notification } from "./notificationApi";



/* ===============================
   AuthProvider
================================ */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.jwtToken);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentNotificationId, setCurrentNotificationId] =
    useState<number | null>(null);


    

    
  // 중복 방지
  const shownNotificationIds = useRef<Set<number>>(new Set());

  // SSE 관리
  const esRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  /* ===============================
     알림 처리
  ================================ */
const handleNotificationSignal = async () => {
  console.log("🔥 NOTIFICATION SIGNAL"); // ✅ 여기 딱 1줄 추가 (맨 위)

  const list: Notification[] = await fetchUnreadNotifications();
  if (!list.length) return;

  const next = list.find(
    (n) => !shownNotificationIds.current.has(n.notificationId)
  );
  if (!next) return;

  shownNotificationIds.current.add(next.notificationId);
  setCurrentNotificationId(next.notificationId);
  setToastMessage(next.message);
  setToastOpen(true);
};


  const markAsRead = async () => {
    if (currentNotificationId == null) return;
    await markNotificationAsRead(currentNotificationId);
  };

  /* ===============================
     SSE 연결
  ================================ */
  useEffect(() => {
  if (!token) return;

  // 🔥 기존 연결 정리
  esRef.current?.close();
  esRef.current = null;

  const es = createNotificationEventSource();
  if (!es) return;

  console.log("🔥 SSE CONNECTED");

  esRef.current = es;

  es.addEventListener("NOTIFICATION", handleNotificationSignal);

  es.onerror = () => {
    console.log("🔥 SSE ERROR → RECONNECT");
    es.close();
    esRef.current = null;
    retryTimerRef.current = window.setTimeout(() => {
      if (useAuthStore.getState().jwtToken) {
        // 🔁 토큰 살아있으면 재연결
        const retryEs = createNotificationEventSource();
        if (!retryEs) return;

        esRef.current = retryEs;
        retryEs.addEventListener("NOTIFICATION", handleNotificationSignal);
      }
    }, 3000);
  };

  // 로그인 직후 미읽음 즉시 체크
  handleNotificationSignal();

  return () => {
    es.close();
    esRef.current = null;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  };
}, [token]); // 🔥 token 바뀔 때마다 무조건 재연결

  /* ===============================
     UI
  ================================ */
  return (
    <>
      {children}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => {
            setToastOpen(false);
            markAsRead();
          }}
          severity="info"
          variant="filled"
          sx={{ cursor: "pointer" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
