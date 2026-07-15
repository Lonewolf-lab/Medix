import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import FullscreenMenu from "./FullscreenMenu.jsx";
import { EASE } from "../common/Reveal.jsx";
import { useAuthStore } from "@/store/authStore";
import { User } from "lucide-react";

const LETTERS = "MEDIX".split("");

export default function PublicNav() {
  const { user, status } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Cream blur backdrop once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 transition-colors duration-500 ${
          scrolled && !open ? "bg-cream/80 backdrop-blur-md border-b border-stone-line/60" : ""
        }`}
      >
        {/* LEFT — logo + animated MEDIX wordmark */}
        <Link to="/" className="group flex items-center gap-3" aria-label="Medix home">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <img
              src="/medix_logo.png"
              alt=""
              className="w-10 h-10 object-contain"
              draggable="false"
            />
          </motion.div>
          <span className="flex overflow-hidden" aria-hidden="true">
            {LETTERS.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.06, ease: EASE }}
                className={`font-display text-2xl tracking-tight transition-colors duration-300 ${
                  open ? "text-cream-light" : "text-ink"
                } group-hover:text-forest`}
              >
                {l}
              </motion.span>
            ))}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {!open && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {status === "authed" && user ? (
                  <Link
                    to="/dashboard"
                    className="w-12 h-12 rounded-full bg-forest hover:bg-ink text-cream-light flex items-center justify-center transition-all duration-300 shadow-sm border border-stone-line/10"
                    title="Go to Dashboard"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="font-mono-accent text-xs tracking-wider border border-stone-line/60 rounded-full px-5 py-2.5 bg-cream/30 backdrop-blur-sm text-ink hover:bg-forest hover:text-cream-light hover:border-forest transition-all duration-300"
                  >
                    SIGN IN
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT — hamburger (dots morph to X) */}
          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-full bg-forest flex items-center justify-center text-cream-light"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="absolute w-4 h-[1.5px] bg-current rotate-45" />
                    <span className="absolute w-4 h-[1.5px] bg-current -rotate-45" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-1 h-1 rounded-full bg-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>
      </motion.nav>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
