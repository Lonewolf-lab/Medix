import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SectionLabel from "../../../components/common/SectionLabel.jsx";
import Reveal, { EASE } from "../../../components/common/Reveal.jsx";

const FAQS = [
  {
    q: "Is Medix a doctor?",
    a: "No — and it never pretends to be. Medix gives you a structured, AI-generated first opinion so you can decide your next step calmly. Every response carries a disclaimer, and anything serious is pointed straight to professional care.",
  },
  {
    q: "What can I actually upload?",
    a: "Lab reports, prescriptions, vaccination records and other health documents as PDF, JPG or PNG (up to 10 MB). Medix reads them, organizes them by type, and can explain any of them on demand.",
  },
  {
    q: "How does the AI know it's *my* answer?",
    a: "Your profile — age, blood group, active medications, recent symptom checks — is injected into every AI request. The answer you get is calibrated to you, not to a generic internet reader.",
  },
  {
    q: "Is my health data private?",
    a: "Your records live in your account and are used only to answer your questions. AI calls run through the Medix backend — the AI provider never gets your identity, and your data is never sold or used for ads.",
  },
  {
    q: "What does it cost?",
    a: "Medix is a personal project in active development and is free to use. Create an account and everything — triage, records, medications, chat, lab dashboard — is included.",
  },
  {
    q: "What if my symptoms are serious?",
    a: "Medix's triage grades severity from LOW to URGENT. If your input suggests something urgent, it tells you plainly to seek professional or emergency care — that guidance always overrides everything else.",
  },
];

function FaqItem({ faq, open, onToggle, index }) {
  return (
    <Reveal delay={index * 0.05}>
      <div className="border-b border-stone-line">
        <button
          onClick={onToggle}
          className="w-full flex items-baseline justify-between gap-6 py-6 text-left group"
          aria-expanded={open}
        >
          <span className="flex items-baseline gap-4">
            <span className="font-mono-accent text-xs text-forest/60 group-hover:text-forest transition-colors">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-display uppercase tracking-tight text-xl md:text-3xl text-ink group-hover:text-forest transition-colors">
              {faq.q}
            </span>
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-2xl md:text-3xl text-forest shrink-0"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="pb-8 pl-8 md:pl-9 max-w-2xl text-ink-soft leading-relaxed text-sm">
                {faq.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="px-6 md:px-16 py-32">
      <SectionLabel>QUESTIONS</SectionLabel>
      <Reveal>
        <h2 className="mt-8 mb-10 font-display uppercase tracking-tight leading-[1.0] text-[9vw] md:text-[4.5vw] text-ink">
          Asked, answered.
        </h2>
      </Reveal>
      <div>
        {FAQS.map((f, i) => (
          <FaqItem
            key={f.q}
            faq={f}
            index={i}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
