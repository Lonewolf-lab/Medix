import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Activity,
  FileText,
  Pill,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Symptom Checker", to: "/symptoms", icon: Activity },
  { label: "Health Records", to: "/records", icon: FileText },
  { label: "Medication Tracker", to: "/medications", icon: Pill },
  { label: "AI Health Chat", to: "/chat", icon: MessageSquare },
  { label: "Profile", to: "/profile", icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    const current = NAV_ITEMS.find((item) => item.to === location.pathname);
    return current ? current.label : "Medix Space";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-ink text-cream-light p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10">
        <img src="/medix_logo.png" alt="Medix logo" className="w-8 h-8 object-contain" />
        <span className="font-display text-xl tracking-wider text-cream-light">MEDIX</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-lg font-sans text-sm tracking-wide transition-all duration-300 ${
                active ? "text-cream-light font-medium" : "text-stone hover:text-cream-light"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-forest/20 border-l-2 border-forest rounded-lg"
                  transition={{ duration: 0.35 }}
                />
              )}
              <Icon className={`w-4 h-4 z-10 ${active ? "text-forest" : "text-stone"}`} />
              <span className="z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Footer */}
      <div className="pt-6 border-t border-ink-line flex flex-col gap-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-stone flex items-center justify-center font-mono-accent text-[11px] font-bold text-ink uppercase">
              {user.name?.slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-xs font-semibold text-cream-light truncate">
                {user.name}
              </span>
              <span className="font-mono-accent text-[9px] tracking-wider text-stone truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-4 px-4 py-3 rounded-lg font-sans text-sm tracking-wide text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-300 w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-cream text-ink">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r border-stone-line/60 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only menu bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-cream border-b border-stone-line/60">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-ink hover:bg-stone-line/20"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-sm tracking-wider uppercase text-ink">MEDIX</span>
          <div className="w-8 h-8" /> {/* Balance spacer */}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-ink md:hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-cream-light hover:bg-ink-line rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
