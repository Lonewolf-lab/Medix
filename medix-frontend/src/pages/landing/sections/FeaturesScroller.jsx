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
      <div className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden bg-cream">
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
                  className={`font-display uppercase text-2xl md:text-4xl tracking-tight transition-all duration-500 ${
                    i === active ? "text-ink translate-x-2" : "text-forest/35"
                  }`}
                >
                  {f.title}
                </span>
              </div>
            ))}
          </div>

          <div className="relative h-44 md:h-60 flex items-center">
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
                <p className="font-display uppercase text-3xl md:text-5xl leading-[1.05] text-ink">
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
    </section>
  );
}
