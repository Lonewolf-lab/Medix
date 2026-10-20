import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Bell, X, CheckCircle2, Shield, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { calendarApi } from "@/api/calendarApi";

export default function GoogleCalendarModal({
  isOpen,
  onClose,
  onConnected,
  onContinueWithoutReminders,
  onContinueWithout,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnectGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.trim() === "" || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      toast("Please configure VITE_GOOGLE_CLIENT_ID in your .env file first.", {
        icon: "🔑",
      });
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      toast.error("Google Identity Services is loading. Please check your internet connection.");
      return;
    }

    try {
      setLoading(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: async (response) => {
          if (response.error) {
            setLoading(false);
            if (response.error !== "popup_closed_by_user") {
              toast.error("Google Calendar authorization was cancelled or failed.");
            }
            return;
          }

          try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const res = await calendarApi.connect({
              accessToken: response.access_token,
              timeZone,
            });

            toast.success(res.message || "Google Calendar connected! Existing schedules synced.");
            onConnected?.(res);
            onClose();
          } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to sync with Google Calendar.");
          } finally {
            setLoading(false);
          }
        },
      });

      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      setLoading(false);
      toast.error("Could not launch Google authorization popup.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-cream border border-stone-line/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
        >
          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone hover:text-ink hover:bg-stone-line/30 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest font-mono-accent text-[10px] tracking-widest uppercase font-medium mb-4">
            <Bell className="w-3 h-3 text-forest" />
            Live Device Reminders
          </div>

          {/* Title & Description */}
          <h2 className="font-display uppercase text-2xl sm:text-3xl text-ink tracking-tight leading-tight">
            Connect Google Calendar
          </h2>
          <p className="mt-2 text-ink-soft text-xs sm:text-sm leading-relaxed">
            Get exact-minute push alarms and lock-screen alerts on your phone and smartwatch for every medication dosage and doctor appointment.
          </p>

          {/* Benefits Feature Cards */}
          <div className="mt-5 space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream-light border border-stone-line/60">
              <Smartphone className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-ink text-xs block">Exact-Minute Phone Alerts</span>
                <span className="text-ink-soft text-[11px] leading-tight block">
                  Reminders ring at the exact scheduled time — not before, not after.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream-light border border-stone-line/60">
              <Calendar className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-ink text-xs block">Automatic Retroactive Sync</span>
                <span className="text-ink-soft text-[11px] leading-tight block">
                  All your previously scheduled doctor visits and active medications sync to Google Calendar instantly.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream-light border border-stone-line/60">
              <Shield className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-ink text-xs block">Optional & Private</span>
                <span className="text-ink-soft text-[11px] leading-tight block">
                  You can always schedule solely inside Medix if you don't need external Google alerts.
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-full bg-forest hover:bg-forest-bright text-cream-light font-mono-accent text-xs tracking-wider uppercase font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{loading ? "Syncing..." : "Connect Google Calendar"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                (onContinueWithoutReminders || onContinueWithout)?.();
                onClose();
              }}
              className="sm:w-auto inline-flex items-center justify-center py-3 px-5 rounded-full border border-stone-line hover:bg-stone-line/20 text-ink-soft hover:text-ink font-mono-accent text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Continue without Reminders
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
