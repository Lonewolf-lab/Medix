import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Logo3D from "./Logo3D.jsx";
import RollHollowText from "../common/RollHollowText.jsx";
import { EASE } from "../common/Reveal.jsx";

const LINKS = [
  { n: "01", label: "HOME", to: "/" },
  { n: "02", label: "FEATURES", to: "/features" },
  { n: "03", label: "ABOUT", to: "/about" },
  { n: "04", label: "CONTACT", to: "/contact" },
];

const overlay = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.7, ease: EASE },
  },
  exit: {
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.55, ease: EASE, delay: 0.15 },
  },
};

const list = {
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const item = {
  hidden: { y: "115%" },
  visible: { y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { y: "115%", transition: { duration: 0.35, ease: EASE } },
};

/**
 * Full-viewport ink menu, split down the middle:
 * LEFT  — reserved stage for the 3D logo (.glb coming; Logo3D is the mount)
 * RIGHT — giant staggered links with scramble + hollow-outline hover.
 */
export default function FullscreenMenu({ open, onClose }) {
  const [hovered, setHovered] = useState(-1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 bg-ink text-cream-light flex flex-col px-6 md:px-16 pt-24 pb-10"
        >
          <div className="flex-1 grid md:grid-cols-[1fr_1.5fr] items-center gap-10 min-h-0">
            {/* LEFT — 3D logo stage (reserved until the .glb arrives) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.45, duration: 0.6, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="hidden md:flex flex-col items-center justify-center gap-8 border-r border-ink-line h-full"
            >
              {/* The 3D mark — model idles/rotates, tilts away from the cursor */}
              <Logo3D interactive className="w-72 h-72" />
              <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">
                MEDIX — AI HEALTH, IN ONE PLACE
              </span>
            </motion.div>

            {/* RIGHT — links */}
            <motion.ul
              variants={list}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
              onMouseLeave={() => setHovered(-1)}
            >
              {LINKS.map((link, i) => (
                <li key={link.n} className="overflow-hidden border-b border-ink-line">
                  <motion.div variants={item}>
                    <Link
                      to={link.to}
                      onClick={onClose}
                      onMouseEnter={() => setHovered(i)}
                      className="group flex items-baseline gap-5 py-2 md:py-3"
                    >
                      <span className="font-mono-accent text-xs text-stone transition-colors group-hover:text-cream-light">
                        {link.n}
                      </span>
                      <span className="font-display uppercase tracking-tight leading-none text-[10vw] md:text-[3.9vw] text-cream-light transition-transform duration-300 group-hover:translate-x-3">
                        <RollHollowText text={link.label} active={hovered === i} />
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.7 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-ink-line"
          >
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">
              MEDIX — AI HEALTH MANAGEMENT
            </span>
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">
              NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
