import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function GoogleAuthButton({ mode = "login" }) {
  const [loading, setLoading] = useState(false);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.trim() === "" || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      toast(
        "Google Client ID is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your .env file.",
        {
          icon: "🔑",
          duration: 5000,
        }
      );
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      toast.error("Google Identity Services is still loading. Please check your internet connection.");
      return;
    }

    try {
      setLoading(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: "email profile openid https://www.googleapis.com/auth/calendar.events",
        callback: async (response) => {
          if (response.error) {
            setLoading(false);
            if (response.error !== "popup_closed_by_user") {
              toast.error("Google sign-in encountered an issue. Please try again.");
            }
            return;
          }

          try {
            await loginWithGoogle(response.access_token);
            toast.success(mode === "register" ? "Account created via Google!" : "Welcome back to Medix!");
            navigate("/dashboard", { replace: true });
          } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to sign in with Google.");
          } finally {
            setLoading(false);
          }
        },
      });

      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      setLoading(false);
      toast.error("Failed to initialize Google authentication popup.");
    }
  };

  return (
    <div className="w-full">
      {/* Editorial divider */}
      <div className="relative my-3.5 sm:my-5 flex items-center justify-center">
        <div className="border-t border-stone-line/50 w-full" />
        <span className="bg-cream px-3 font-mono-accent text-[9px] sm:text-[10px] tracking-widest text-stone uppercase select-none">
          or
        </span>
        <div className="border-t border-stone-line/50 w-full" />
      </div>

      {/* Google Auth Button: Responsive (compact on mobile, editorial pill on desktop) */}
      <motion.button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full py-2.5 sm:py-3 px-4 border border-stone-line/80 bg-cream-light/60 hover:bg-cream-light hover:border-forest/40 transition-all text-ink shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="font-mono-accent text-[11px] sm:text-xs tracking-wider uppercase font-medium text-ink">
          {loading
            ? "Connecting..."
            : mode === "register"
            ? "Sign up with Google"
            : "Continue with Google"}
        </span>
      </motion.button>
    </div>
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
