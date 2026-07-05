import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { EASE } from "../components/common/Reveal.jsx";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink text-cream-light flex flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="font-display leading-none text-[38vw] md:text-[20vw] text-outline-cream select-none"
        aria-hidden="true"
      >
        404
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-mono-accent text-xs tracking-[0.3em] text-stone"
      >
        THIS PAGE DOESN'T EXIST — YOUR HEALTH DATA DOES.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
        whileHover={{ scale: 1.04 }}
        className="mt-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-full pl-2 pr-8 py-2.5 bg-forest text-cream-light font-mono-accent text-xs tracking-widest uppercase"
        >
          <span className="w-9 h-9 rounded-full bg-ink flex items-center justify-center text-[10px]">●</span>
          Back to Medix
        </Link>
      </motion.div>
    </div>
  );
}
