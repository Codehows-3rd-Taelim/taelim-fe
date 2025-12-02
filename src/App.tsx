import './App.css'
import LoginPage from './login/pages/LoginPage'
import { Route, Routes } from "react-router-dom"
import { PrivateRoute } from './PrivateRoute'
import OperationManagement from './operationManagement/pages/OperationManagement'
import ReportPage from "./aiReport/pages/AiReportPage";
import AiReportPage from "./aiReport/pages/AiReportPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/report"
        element={
          <PrivateRoute>
            <ReportPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <OperationManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/aiReport"
        element={
          <PrivateRoute>
            <AiReportPage />
          </PrivateRoute>
        }
      />
      {/* 다른 보호된 라우트들도 여기에 추가 */}
      {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
    </Routes>
  );
}

export default App;
