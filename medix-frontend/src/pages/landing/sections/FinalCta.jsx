import { motion } from "motion/react";
import { Link } from "react-router-dom";
import SectionLabel from "../../../components/common/SectionLabel.jsx";
import { EASE } from "../../../components/common/Reveal.jsx";

export default function FinalCta() {
  return (
    <section className="relative bg-ink text-cream-light px-6 md:px-16 py-32 flex flex-col justify-between min-h-screen">
      <SectionLabel>START NOW</SectionLabel>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="font-display uppercase text-[11vw] md:text-[6vw] leading-[0.95] my-16"
      >
        Health clarity,
        <br />
        powered by AI<span className="text-forest-bright">.</span>
      </motion.h2>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="max-w-md text-stone leading-relaxed text-sm"
        >
          One account. Your symptoms triaged, your records readable, your
          medications on schedule, your labs decoded. The next time your body
          asks a question, you'll have somewhere calm to take it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="w-fit"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-3 rounded-full pl-2 pr-8 py-2.5 bg-forest text-cream-light font-mono-accent text-xs tracking-widest uppercase"
          >
            <span className="w-9 h-9 rounded-full bg-ink flex items-center justify-center text-[10px]">
              ●
            </span>
            Create your account — free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
