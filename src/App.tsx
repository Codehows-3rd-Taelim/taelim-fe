import "./App.css";
import LoginPage from "./login/pages/LoginPage";
import { Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import OperationManagement from "./operationManagement/pages/OperationManagement";
import AiReportPage from "./aiReport/pages/AiReportPage";
import { Container, Box } from "@mui/material";
import ReportPage from "./report/pages/ReportPage";
import AIChat from "./aichat/AIChat";
import Footer from "./components/Footer";
import AuthProvider from "./AuthProvider";
import Header from "./components/Header";
import EmbeddingPage from "./embedding/pages/EmbeddingPage";
import DashboardPage from "./dashboard/pages/DashboardPage";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <AuthProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh", // minHeight에서 height로 변경
        }}
      >
        {!isLoginPage && <Header />}

        <Box
          component="main"
          sx={{
            pt: isLoginPage ? 0 : "64px",
            flex: 1,
            minHeight: 0, // 추가
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Container
            disableGutters
            maxWidth={false}
            sx={{
              width: "100%",
              height: "100%", // flex: 1 대신 height: 100% 사용
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              // backgroundColor: "#f3f4f6",
            }}
          >
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
              <Route
                path="/data"
                element={
                  <PrivateRoute>
                    <EmbeddingPage />
                  </PrivateRoute>
                }
              />
            </Routes>
            {!isLoginPage && (
              <Box component="footer" sx={{ width: "100%", flexShrink: 0 }}>
                <Footer />
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
