import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/AuthPage/LoginPage.tsx'
import DashboardPage from './pages/Dashboard/DashboardPage.tsx'
import GalleryPage from './pages/Gallery/GalleryPage.tsx'
import AlbumDetailsPage from './pages/Gallery/AlbumDetailsPage.tsx'
import NewsPage from './pages/News/NewsPage.tsx'
import NewsFormPage from './pages/News/NewsFormPage.tsx'
import HeroSectionPage from './pages/SiteAssets/HeroSectionPage.tsx'
import EventsPage from './pages/Events/EventsPage.tsx'

import RegisterPage from './pages/AuthPage/RegisterPage.tsx'
import ForgotPasswordPage from './pages/AuthPage/ForgotPasswordPage.tsx'
import VerifyEmailPage from './pages/AuthPage/VerifyEmailPage.tsx'
import ResetPasswordPage from './pages/AuthPage/ResetPasswordPage.tsx'
import AuthGuard from './guard/AuthGuard.tsx'
import AppLayout from './layout/AppLayout.tsx'
import MemberPage from './pages/Members/MemberPage.tsx'

import TeamLookupsPage from './pages/Members/TeamLookupsPage.tsx'
import ProfilePage from './pages/Profile/ProfilePage.tsx'
import ContactInfoPage from './pages/Contact/ContactInfoPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

      <Route element={<AuthGuard />}>
        {/* Protected routes go here */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MemberPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:albumId" element={<AlbumDetailsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/new" element={<NewsFormPage />} />
          <Route path="/news/:id/edit" element={<NewsFormPage />} />
          <Route path="/hero-section" element={<HeroSectionPage />} />
          <Route path="/contact-info" element={<ContactInfoPage />} />
          <Route path="/events" element={<EventsPage />} />

          <Route path="/team-settings" element={<TeamLookupsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
