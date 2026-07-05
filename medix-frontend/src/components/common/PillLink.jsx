import { Link } from "react-router-dom";
import { motion } from "motion/react";

/**
 * The reference's signature pill CTA: dark capsule, green dot, mono uppercase.
 * `dark` flips it for use on ink backgrounds.
 */
export default function PillLink({ to, children, dark = false, className = "" }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`w-fit ${className}`}
    >
      <Link
        to={to}
        className={`inline-flex items-center gap-3 rounded-full pl-2 pr-6 py-2 font-mono-accent text-xs tracking-widest uppercase ${
          dark ? "bg-cream-light text-ink" : "bg-ink text-cream-light"
        }`}
      >
        <span className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-[10px] text-cream-light">
          ●
        </span>
        {children}
      </Link>
    </motion.div>
  );
}
