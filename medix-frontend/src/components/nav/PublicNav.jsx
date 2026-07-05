import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Logo3D from "./Logo3D.jsx";
import FullscreenMenu from "./FullscreenMenu.jsx";
import { EASE } from "../common/Reveal.jsx";

const LETTERS = "MEDIX".split("");

export default function PublicNav() {
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
        {/* LEFT — 3D logo slot + animated MEDIX wordmark */}
        <Link to="/" className="group flex items-center gap-3" aria-label="Medix home">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <Logo3D />
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
      </motion.nav>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
