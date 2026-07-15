import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { STEPS } from "../../../data/features.js";
import SectionLabel from "../../../components/common/SectionLabel.jsx";
import Reveal from "../../../components/common/Reveal.jsx";

function Step({ step, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Each giant number drifts at a different parallax speed.
  const y = useTransform(scrollYProgress, [0, 1], [80 + index * 50, -80 - index * 50]);

  return (
    <div ref={ref} className="relative grid md:grid-cols-2 gap-6 items-center py-16 md:py-24 border-b border-stone-line last:border-b-0">
      <motion.span
        style={{ y }}
        className="font-display text-outline-ink text-[28vw] md:text-[14vw] leading-none select-none"
        aria-hidden="true"
      >
        {step.n}
      </motion.span>
      <Reveal>
        <h3 className="font-display uppercase tracking-tight text-3xl md:text-5xl text-ink">
          {step.title}
        </h3>
        <p className="mt-5 text-forest/80 leading-relaxed max-w-md">{step.text}</p>
      </Reveal>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-16 py-32">
      <SectionLabel>HOW IT WORKS</SectionLabel>
      <Reveal>
        <h2 className="mt-8 mb-6 font-display uppercase tracking-tight leading-[1.0] text-[9vw] md:text-[4.5vw] text-ink">
          Three steps to calm.
        </h2>
      </Reveal>
      <div>
        {STEPS.map((s, i) => (
          <Step key={s.n} step={s} index={i} />
        ))}
      </div>
    </section>
  );
}
