import "./App.css";
import LoginPage from "./login/pages/LoginPage";
import { Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import OperationManagement from "./operationManagement/pages/OperationManagement";
import AiReportPage from "./aiReport/pages/AiReportPage";
import { Container, Box } from "@mui/material";
import ReportPage from "./report/pages/ReportPage";
import AIChat from "./aichat/AIChat";
import DashboardPage from "./Dashboard/pages/DashboardPage";
import AuthProvider from "./AuthProvider";
import Header from "./Components/Header";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
     <AuthProvider>
      {!isLoginPage && <Header />}
      <Box
        sx={{
          pt: isLoginPage ? 0 : "64px", // 헤더 높이만큼 padding-top 추가
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl" sx={{ maxWidth: "1800px !important" }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AIChat />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai/report"
              element={
                <PrivateRoute>
                  <AiReportPage />
                </PrivateRoute>
              }
            />
            {/* <Route path="/dashboard/admin" element={<PrivateRoute><UserDashboardPage /></PrivateRoute>} /> */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/report"
              element={
                <PrivateRoute>
                  <ReportPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <PrivateRoute>
                  <OperationManagement />
                </PrivateRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
      </AuthProvider>
    </>
  );
}

export default App;
