import './App.css'
import LoginPage from './login/pages/LoginPage'
import { Route, Routes } from "react-router-dom"
import { PrivateRoute } from './PrivateRoute'
import OperationManagement from './OperationManagement/pages/OperationManagement'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <OperationManagement />
          </PrivateRoute>
        } 
      />
      {/* 다른 보호된 라우트들도 여기에 추가 */}
      {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
    </Routes>
  )
}

export default App
