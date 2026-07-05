import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import FeaturesPage from "./pages/features/FeaturesPage.jsx";
import AboutPage from "./pages/about/AboutPage.jsx";
import ContactPage from "./pages/contact/ContactPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      {/* Auth pages carry their own full-screen layout (no public nav/footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
