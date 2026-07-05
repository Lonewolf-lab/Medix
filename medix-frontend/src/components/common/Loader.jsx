import { motion } from "motion/react";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-ink">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Heartbeat pulse animation */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1, 1.4, 1],
            opacity: [0.3, 0.8, 0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-12 h-12 rounded-full bg-forest/20"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1, 1.25, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-6 h-6 rounded-full bg-forest flex items-center justify-center"
        >
          {/* Subtle cross core */}
          <div className="w-3 h-0.5 bg-cream-light rounded-full absolute" />
          <div className="h-3 w-0.5 bg-cream-light rounded-full absolute" />
        </motion.div>
      </div>
      {label && (
        <span className="font-mono-accent text-[11px] tracking-[0.2em] uppercase text-stone text-center animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
