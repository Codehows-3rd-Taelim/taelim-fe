import "./App.css";
import LoginPage from "./login/pages/LoginPage";
import { Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import OperationManagement from "./operationManagement/pages/OperationManagement";
import AiReportPage from "./aiReport/pages/AiReportPage";
import { Container, Box } from "@mui/material";
import Header from "./components/Header";
import ReportPage from "./report/pages/ReportPage";
import DashboardPage from "./Dashboard/pages/DashboardPage";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
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
            {/* <Route path="/ai/chat" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
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
    </>
  );
}

export default App;
