import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { FEATURES } from "../../data/features.js";
import SectionLabel from "../../components/common/SectionLabel.jsx";
import Reveal, { WordReveal, EASE } from "../../components/common/Reveal.jsx";
import Marquee from "../../components/common/Marquee.jsx";
import PillLink from "../../components/common/PillLink.jsx";

/** One full-viewport feature panel; alternates cream / ink. */
function FeaturePanel({ feature, index }) {
  const dark = index % 2 === 1;
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const numberY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const leftY = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  // Stacking parallax: scale down and fade out slightly as the next card scrolls over it
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0.4]);
  const exitY = useTransform(scrollYProgress, [0.6, 1], [0, -40]);

  return (
    <section
      ref={ref}
      style={{ zIndex: index }}
      className={`sticky top-0 h-screen w-full flex items-center overflow-hidden px-5 sm:px-6 md:px-16 ${
        dark ? "bg-forest-bright text-ink" : "bg-cream text-ink"
      }`}
    >
      {/* Parallax giant number */}
      <motion.span
        style={{ y: numberY }}
        aria-hidden="true"
        className={`absolute -right-2 md:right-10 top-16 md:top-10 font-display leading-none text-[34vw] md:text-[24vw] select-none ${
          dark ? "text-outline-ink opacity-15" : "text-outline-ink opacity-25"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <motion.div
        style={{ scale, opacity, y: exitY }}
        className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-14 items-center w-full py-10 md:py-0"
      >
        <motion.div style={{ y: leftY }}>
          <SectionLabel className={dark ? "text-ink/60" : ""}>{feature.label}</SectionLabel>
          <Reveal>
            <h2 className="mt-3 sm:mt-4 md:mt-6 font-display uppercase tracking-tight leading-[0.95] text-3xl sm:text-5xl md:text-[4.8vw]">
              {feature.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={`mt-2 sm:mt-3 md:mt-4 font-display uppercase tracking-tight text-base sm:text-xl md:text-2xl ${dark ? "text-ink-soft" : "text-forest"}`}>
              {feature.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={`mt-3 sm:mt-4 md:mt-6 max-w-md leading-relaxed text-xs sm:text-sm text-justify md:text-left ${dark ? "text-ink-soft/90" : "text-ink-soft"}`}>
              {feature.description}
            </p>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: rightY }}>
          <ul className="flex flex-col">
            {feature.details.map((d, i) => (
              <motion.li
                key={d}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className={`flex items-baseline gap-3 py-2.5 sm:py-3.5 md:py-4 border-b ${
                  dark ? "border-ink-line/30" : "border-stone-line"
                }`}
              >
                <span className={`font-mono-accent text-[11px] sm:text-xs ${dark ? "text-ink/40" : "text-ink/60"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-xs sm:text-sm md:text-base leading-relaxed ${dark ? "text-ink font-medium" : "text-forest font-medium"}`}>
                  {d}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <>
      {/* Page hero */}
      <section className="min-h-[60vh] md:min-h-[80vh] flex flex-col justify-end items-center md:items-start text-center md:text-left px-5 sm:px-6 md:px-16 pb-12 md:pb-16 pt-24 md:pt-32">
        <SectionLabel>FEATURES</SectionLabel>
        <h1 className="mt-4 sm:mt-6 font-display uppercase tracking-tight leading-[0.95] text-[10vw] sm:text-[9vw] md:text-[7.5vw] text-ink">
          <WordReveal text="Five modules. One calm system." />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-4 sm:mt-8 max-w-lg text-ink-soft text-xs sm:text-sm md:text-base leading-relaxed text-justify md:text-left">
            Everything in Medix exists to answer one question well: “what should
            I do about my health, right now?” Scroll through what each module
            does — and how they feed each other.
          </p>
        </Reveal>
      </section>

      <Marquee
        items={["Triage", "Records", "Medications", "Chat", "Labs"]}
        className="py-5 md:py-8 border-y border-stone-line"
      />

      {FEATURES.map((f, i) => (
        <FeaturePanel key={f.id} feature={f} index={i} />
      ))}

      {/* Everything-connects strip */}
      <section className="px-5 sm:px-6 md:px-16 py-16 sm:py-24 md:py-32">
        <SectionLabel>THE POINT</SectionLabel>
        <h2 className="mt-6 md:mt-8 font-display uppercase tracking-tight leading-[1.02] text-[7.5vw] sm:text-[6.5vw] md:text-[4vw] text-ink max-w-5xl text-justify md:text-left">
          <WordReveal text="Each module feeds the next. Your meds inform your triage. Your labs inform your chat. That's the difference between a tool and a system." />
        </h2>
        <Reveal delay={0.2} className="mt-8 sm:mt-12">
          <PillLink to="/register">Try it yourself</PillLink>
        </Reveal>
      </section>
    </>
  );
}
