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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const numberY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const leftY = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : 35, isMobile ? 0 : -35]);
  const rightY = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : -45, isMobile ? 0 : 45]);

  // Stacking parallax: scale down and fade out slightly as the next card scrolls over it
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0.35]);
  const exitY = useTransform(scrollYProgress, [0.6, 1], [0, -50]);

  return (
    <section
      ref={ref}
      style={{ zIndex: index }}
      className={`w-full flex items-center overflow-hidden px-6 md:px-16 ${
        isMobile ? "relative min-h-screen py-28" : "sticky top-0 h-screen"
      } ${dark ? "bg-forest-bright text-ink" : "bg-cream text-ink"}`}
    >
      {/* Parallax giant number */}
      <motion.span
        style={{ y: numberY }}
        aria-hidden="true"
        className={`absolute -right-4 md:right-10 top-10 font-display leading-none text-[45vw] md:text-[24vw] select-none ${
          dark ? "text-outline-ink opacity-15" : "text-outline-ink opacity-25"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <motion.div
        style={{ scale: isMobile ? 1 : scale, opacity: isMobile ? 1 : opacity, y: isMobile ? 0 : exitY }}
        className="relative grid md:grid-cols-2 gap-14 items-center w-full"
      >
        <motion.div style={{ y: leftY }}>
          <SectionLabel className={dark ? "text-ink/60" : ""}>{feature.label}</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display uppercase tracking-tight leading-[0.95] text-[11vw] md:text-[4.8vw]">
              {feature.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={`mt-4 font-display uppercase tracking-tight text-xl md:text-2xl ${dark ? "text-ink-soft" : "text-forest"}`}>
              {feature.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={`mt-6 max-w-md leading-relaxed text-sm ${dark ? "text-ink-soft/90" : "text-ink-soft"}`}>
              {feature.description}
            </p>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: rightY }}>
          <ul className="flex flex-col">
            {feature.details.map((d, i) => (
              <motion.li
                key={d}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className={`flex items-baseline gap-4 py-4 border-b ${
                  dark ? "border-ink-line/30" : "border-stone-line"
                }`}
              >
                <span className={`font-mono-accent text-xs ${dark ? "text-ink/40" : "text-ink/60"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-sm md:text-base leading-relaxed ${dark ? "text-ink" : "text-forest"}`}>
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
      <section className="min-h-[80vh] flex flex-col justify-end px-6 md:px-16 pb-16 pt-32">
        <SectionLabel>FEATURES</SectionLabel>
        <h1 className="mt-6 font-display uppercase tracking-tight leading-[0.95] text-[13vw] md:text-[7.5vw] text-ink">
          <WordReveal text="Five modules. One calm system." />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-lg text-ink-soft leading-relaxed">
            Everything in Medix exists to answer one question well: “what should
            I do about my health, right now?” Scroll through what each module
            does — and how they feed each other.
          </p>
        </Reveal>
      </section>

      <Marquee
        items={["Triage", "Records", "Medications", "Chat", "Labs"]}
        className="py-8 border-y border-stone-line"
      />

      {FEATURES.map((f, i) => (
        <FeaturePanel key={f.id} feature={f} index={i} />
      ))}

      {/* Everything-connects strip */}
      <section className="px-6 md:px-16 py-32">
        <SectionLabel>THE POINT</SectionLabel>
        <h2 className="mt-8 font-display uppercase tracking-tight leading-[1.02] text-[8.5vw] md:text-[4vw] text-ink max-w-5xl">
          <WordReveal text="Each module feeds the next. Your meds inform your triage. Your labs inform your chat. That's the difference between a tool and a system." />
        </h2>
        <Reveal delay={0.2} className="mt-12">
          <PillLink to="/register">Try it yourself</PillLink>
        </Reveal>
      </section>
    </>
  );
}
