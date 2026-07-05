import { motion } from "motion/react";

/** Infinite horizontal marquee strip (editorial-site staple). */
export default function Marquee({ items, dark = false, className = "" }) {
  const row = [...items, ...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="inline-flex items-center gap-10"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-10">
            <span
              className={`font-display uppercase text-4xl md:text-6xl tracking-tight ${
                dark ? "text-cream-light" : "text-ink"
              }`}
            >
              {item}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-forest shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
