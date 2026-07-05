import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

/** Fade-up on scroll into view — the standard entrance across the site. */
export default function Reveal({ children, delay = 0, y = 30, className = "", once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word staggered reveal for big statements. */
export function WordReveal({ text, className = "", light = false }) {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.06 }}
      className={className}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%" },
              visible: { y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export { EASE };
