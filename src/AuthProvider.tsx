// import { useEffect, useState } from "react";
// import { Snackbar, Alert } from "@mui/material";
// import { useAuthStore } from "./store";
// import { createNotificationEventSource } from "./aichat/api/aiChatApi";

// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const token = useAuthStore((state) => state.jwtToken);

//   // 토스트 상태
//   const [toastOpen, setToastOpen] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");

//   useEffect(() => {
//     if (!token) return;

//     const es = createNotificationEventSource();
//     if (!es) return;

//     // event 수신
//     es.addEventListener("AI_RESPONSE_DONE", (e: MessageEvent) => {
//       const data = JSON.parse(e.data);

//       setToastMessage("AI 답변이 도착했습니다");
//       setToastOpen(true);
//     });

//     es.onerror = () => {
//       es.close();
//     };

//     return () => {
//       es.close();
//     };
//   }, [token]);

//   return (
//     <>
//       {children}

//       <Snackbar
//         open={toastOpen}
//         autoHideDuration={4000}
//         onClose={() => setToastOpen(false)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//         sx={{ ml: 2, mb: 2 }}   
//       >

//         <Alert
//           onClose={() => setToastOpen(false)}
//           severity="info"
//           variant="filled"
//           sx={{ width: "100%" }}
//         >
//           {toastMessage}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }
