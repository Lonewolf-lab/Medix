import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { FEATURES } from "../../../data/features.js";
import SectionLabel from "../../../components/common/SectionLabel.jsx";
import { EASE } from "../../../components/common/Reveal.jsx";

/**
 * The signature pinned section: 5×100vh of scroll drives the active feature.
 * Left column = numbered feature list, right = crossfading taglines.
 */
export default function FeaturesScroller() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(FEATURES.length - 1, Math.floor(v * FEATURES.length));
    setActive(idx);
  });

  return (
    <section id="features" ref={ref} className="relative" style={{ height: `${FEATURES.length * 100}vh` }}>
      {/* MOBILE-ONLY VERTICAL-SCROLL-DRIVEN HORIZONTAL PARALLAX */}
      <div className="block md:hidden sticky top-0 h-screen flex flex-col justify-between py-16 overflow-hidden bg-cream">
        <div>
          <SectionLabel className="mb-4 px-6">WHAT MEDIX DOES</SectionLabel>

          {/* Horizontal animated titles track — 0px parent offset ensures 50vw is dead-center */}
          <div className="relative w-full overflow-hidden py-3 my-2">
            <motion.div
              animate={{ x: `calc(50vw - ${(active + 5) * 153 + 72.5}px)` }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center gap-2 whitespace-nowrap w-max"
            >
              {[...FEATURES, ...FEATURES, ...FEATURES].map((f, i) => {
                const isActive = (i % FEATURES.length) === active;
                return (
                  <div
                    key={`${f.id}-${i}`}
                    className={`flex items-baseline gap-1.5 transition-all duration-300 w-[145px] flex-shrink-0 justify-center ${
                      isActive ? "scale-100 opacity-100" : "scale-90 opacity-40"
                    }`}
                  >
                    <span
                      className={`font-mono-accent text-xs transition-colors ${
                        isActive ? "text-forest font-medium" : "text-forest/40 font-normal"
                      }`}
                    >
                      {String((i % FEATURES.length) + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display uppercase tracking-normal transition-colors duration-300 ${
                        isActive
                          ? "text-ink font-normal text-base sm:text-lg"
                          : "text-forest/35 font-normal text-sm"
                      }`}
                    >
                      {f.title}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Active Feature Tagline & Info (Independent text, no card container) */}
        <div className="relative h-60 flex flex-col justify-center items-center px-4 text-center">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              animate={{
                opacity: i === active ? 1 : 0,
                y: i === active ? 0 : 20,
              }}
              transition={{ duration: 0.45, ease: EASE }}
              style={{ pointerEvents: i === active ? "auto" : "none", zIndex: i === active ? 1 : 0 }}
              className="absolute w-full max-w-sm flex flex-col items-center"
            >
              <span className="inline-block font-mono-accent text-[11px] tracking-widest uppercase text-forest font-semibold mb-2">
                {f.label}
              </span>
              <h3 className="font-display uppercase text-2xl sm:text-3xl leading-[1.08] text-ink mb-3">
                {f.tagline}
              </h3>
              <p className="text-ink-soft text-xs sm:text-sm leading-relaxed max-w-xs text-center mb-4">
                {f.description}
              </p>
              <Link
                to="/features"
                className="link-underline inline-block font-mono-accent text-xs tracking-widest uppercase text-forest font-semibold"
              >
                Learn more →
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs font-mono-accent px-4 pt-2">
          <div className="flex items-center gap-1.5">
            {FEATURES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-forest" : "w-1.5 bg-stone-line"
                }`}
              />
            ))}
          </div>
          <span className="text-forest font-semibold">
            0{active + 1} / 0{FEATURES.length}
          </span>
        </div>
      </div>

      {/* DESKTOP-ONLY PINNED SCROLLER (100% UNTOUCHED) */}
      <div
        ref={ref}
        className="hidden md:block relative"
        style={{ height: `${FEATURES.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex flex-col justify-center px-16 overflow-hidden bg-cream">
          <SectionLabel className="mb-10">WHAT MEDIX DOES</SectionLabel>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-1">
              {FEATURES.map((f, i) => (
                <div key={f.id} className="flex items-baseline gap-4 py-3 border-b border-stone-line">
                  <span
                    className={`font-mono-accent text-xs transition-colors ${
                      i === active ? "text-forest font-bold" : "text-forest/50"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-display uppercase text-4xl tracking-tight transition-all duration-500 ${
                      i === active ? "text-ink translate-x-2" : "text-forest/35"
                    }`}
                  >
                    {f.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative h-60 flex items-center">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.id}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ pointerEvents: i === active ? "auto" : "none", zIndex: i === active ? 1 : 0 }}
                  className="absolute max-w-lg"
                >
                  <p className="font-display uppercase text-5xl leading-[1.05] text-ink">
                    {f.tagline}
                  </p>
                  <Link
                    to="/features"
                    className="link-underline mt-6 inline-block font-mono-accent text-xs tracking-widest uppercase text-forest hover:text-forest-bright transition-colors"
                  >
                    Learn more →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 font-mono-accent text-xs text-forest/60">
            {active + 1}/{FEATURES.length}
          </div>
        </div>
      </div>
    </section>
  );
}
