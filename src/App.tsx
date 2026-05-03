
import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/AuthPage/LoginPage.tsx'
import DashboardPage from './pages/Dashboard/DashboardPage.tsx'

import RegisterPage from './pages/AuthPage/RegisterPage.tsx'
import ForgotPasswordPage from './pages/AuthPage/ForgotPasswordPage.tsx'
import VerifyEmailPage from './pages/AuthPage/VerifyEmailPage.tsx'
import ResetPasswordPage from './pages/AuthPage/ResetPasswordPage.tsx'
import AuthGuard from './guard/AuthGuard.tsx'
import AppLayout from './layout/AppLayout.tsx'
import MemberPage from './pages/Members/MemberPage.tsx'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

 
      <Route element={<AuthGuard />}>
        {/* Protected routes go here */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MemberPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App