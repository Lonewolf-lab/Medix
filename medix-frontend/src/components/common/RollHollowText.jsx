import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Per-letter roll effect: at rest the word is SOLID; on `active`, each letter
 * rolls upward with a stagger and is replaced by its HOLLOW (outlined) twin
 * rising from below — mid-transition shows a mix of both, wave-style.
 */
export default function RollHollowText({ text, active, className = "" }) {
  const letters = text.split("");

  return (
    <span className={`inline-flex ${className}`}>
      {/* Real text for screen readers; the animated letters are decorative */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {letters.map((ch, i) => (
          <span
            key={i}
            className="relative inline-block"
            /* clip vertically (hide the roll) but let the stroke breathe horizontally */
            style={{ overflow: "visible clip" }}
          >
            <motion.span
              className="block"
              animate={{ y: active ? "-105%" : "0%" }}
              transition={{ duration: 0.42, delay: i * 0.036, ease: EASE }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
            <motion.span
              className="absolute inset-0 block text-hollow-cream"
              animate={{ y: active ? "0%" : "105%" }}
              transition={{ duration: 0.42, delay: i * 0.036, ease: EASE }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          </span>
        ))}
      </span>
    </span>
  );
}
