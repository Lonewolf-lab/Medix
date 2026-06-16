import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute, { GuestOnlyRoute } from '@/routes/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import SymptomCheckerPage from '@/pages/SymptomCheckerPage'
import HealthRecordsPage from '@/pages/HealthRecordsPage'
import MedicationsPage from '@/pages/MedicationsPage'
import ChatPage from '@/pages/ChatPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.landing} element={<LandingPage />} />

      {/* Guests only */}
      <Route element={<GuestOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.symptoms} element={<SymptomCheckerPage />} />
          <Route path={ROUTES.records} element={<HealthRecordsPage />} />
          <Route path={ROUTES.medications} element={<MedicationsPage />} />
          <Route path={ROUTES.chat} element={<ChatPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
