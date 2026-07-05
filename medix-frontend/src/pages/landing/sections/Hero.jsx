import { motion, useScroll, useTransform } from "motion/react";
import PillLink from "../../../components/common/PillLink.jsx";
import { EASE } from "../../../components/common/Reveal.jsx";

export default function Hero() {
  // Gentle parallax: headline drifts up slightly as you scroll away.
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -80]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.25]);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-end px-6 md:px-16 pb-20 pt-32 overflow-hidden"
    >
      <motion.div style={{ y, opacity }} className="max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="font-mono-accent text-xs tracking-[0.3em] text-stone mb-6"
        >
          MEDIX® — AI-POWERED PERSONAL HEALTH
        </motion.p>

        <h1 className="font-display uppercase leading-[0.92] tracking-tight text-ink">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              className="block text-[16vw] md:text-[9vw]"
            >
              Medix<span className="text-forest">.</span>
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.32, ease: EASE }}
              className="block text-[9.5vw] md:text-[5.4vw]"
            >
              Your health, finally
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.44, ease: EASE }}
              className="block text-[9.5vw] md:text-[5.4vw]"
            >
              in one place<span className="text-forest">.</span>
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          className="max-w-md mt-8 text-ink-soft text-base leading-relaxed"
        >
          Stop panic-Googling symptoms at 2 AM. Medix gives you AI symptom
          triage, organized health records, smart medication tracking and
          decoded lab reports — calm, private, and personal to you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
          className="flex flex-wrap items-center gap-5 mt-10"
        >
          <PillLink to="/register">Get Started</PillLink>
          <motion.span whileHover={{ x: 4 }}>
            <a
              href="/features"
              className="link-underline font-mono-accent text-xs tracking-widest uppercase text-ink-soft"
            >
              Explore features →
            </a>
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Vertical scroll cue */}
      <div className="absolute right-6 md:right-16 bottom-16 hidden sm:flex flex-col items-center gap-4">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone [writing-mode:vertical-rl]">
          SCROLL DOWN
        </span>
        <div className="w-px h-16 bg-stone overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2 bg-ink"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
