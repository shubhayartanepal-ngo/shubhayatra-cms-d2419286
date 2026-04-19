
import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/AuthPage/LoginPage.tsx'
import DashboardPage from './pages/AuthPage/DashboardPage'
import RegisterPage from './pages/AuthPage/RegisterPage.tsx'
import ForgotPasswordPage from './pages/AuthPage/ForgotPasswordPage.tsx'
import VerifyEmailPage from './pages/AuthPage/VerifyEmailPage.tsx'
import ResetPasswordPage from './pages/AuthPage/ResetPasswordPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
