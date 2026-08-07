import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "motion/react";
import EditorialEntranceLoader from "./components/common/EditorialEntranceLoader";
import ServerSpinUpOverlay from "./components/common/ServerSpinUpOverlay";

// Public imports
import PublicLayout from "./components/layout/PublicLayout.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import FeaturesPage from "./pages/features/FeaturesPage.jsx";
import AboutPage from "./pages/about/AboutPage.jsx";
import ContactPage from "./pages/contact/ContactPage.jsx";

// Auth imports
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";

// Private layout & pages
import ProtectedRoute, { GuestOnlyRoute } from "./routes/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import SymptomCheckerPage from "./pages/dashboard/SymptomCheckerPage.jsx";
import HealthRecordsPage from "./pages/dashboard/HealthRecordsPage.jsx";
import MedicationsPage from "./pages/dashboard/MedicationsPage.jsx";
import CalendarPage from "./pages/dashboard/CalendarPage.jsx";
import ChatPage from "./pages/dashboard/ChatPage.jsx";
import ProfilePage from "./pages/dashboard/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [showEntrance, setShowEntrance] = useState(true);

  // Bootstrap auth state (query user session via cookie)
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showEntrance && (
          <EditorialEntranceLoader onComplete={() => setShowEntrance(false)} />
        )}
      </AnimatePresence>

      {!showEntrance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-screen bg-cream text-ink font-sans"
        >
          <Toaster
            position="top-right"
            toastOptions={{
              className: "font-mono-accent text-xs bg-ink text-cream border border-stone-line/20 rounded-lg",
              duration: 4000,
            }}
          />
          <ServerSpinUpOverlay />
          <Routes>
            {/* Public Marketing Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Guest-Only Auth Routes */}
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/symptoms" element={<SymptomCheckerPage />} />
                <Route path="/records" element={<HealthRecordsPage />} />
                <Route path="/medications" element={<MedicationsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      )}
    </>
  );
}

export default App;
