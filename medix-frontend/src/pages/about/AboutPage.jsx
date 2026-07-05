import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import SectionLabel from "../../components/common/SectionLabel.jsx";
import Reveal, { WordReveal, EASE } from "../../components/common/Reveal.jsx";
import PillLink from "../../components/common/PillLink.jsx";

const VALUES = [
  {
    n: "01",
    title: "Calm over alarm",
    text: "Health information should lower your heart rate, not raise it. Every screen, every AI answer is designed to be measured — severity when it's warranted, reassurance when it's not.",
  },
  {
    n: "02",
    title: "Context is everything",
    text: "The same symptom means different things for different people. Medix answers with your age, history and medications in mind — never generic internet advice.",
  },
  {
    n: "03",
    title: "Honesty about limits",
    text: "Medix is a first opinion, not a diagnosis. It says so, everywhere. Anything serious gets pointed at real professional care, immediately and unambiguously.",
  },
  {
    n: "04",
    title: "Privacy by architecture",
    text: "Your records live in your account. AI requests run through the Medix backend, so the model provider never sees who you are. No ads, no data resale — ever.",
  },
];

const ROADMAP = [
  { when: "PHASE 1", what: "The engine", detail: "Full backend: auth, records, medications, triage, chat, lab dashboard — every AI feature working end to end." },
  { when: "PHASE 2", what: "The experience", detail: "This frontend: an editorial, animation-rich interface that makes health management feel calm instead of clinical." },
  { when: "PHASE 3", what: "The agents", detail: "AI that acts, not just answers — appointment scheduling from a sentence, proactive nudges, medication safety checks, lab trends." },
  { when: "PHASE 4", what: "The world", detail: "Live deployment, real users, and the long tail: voice logging, report exports, deeper personalization." },
];

function ParallaxQuote({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <motion.blockquote
      ref={ref}
      style={{ y }}
      className="font-display uppercase tracking-tight leading-[1.05] text-[7.5vw] md:text-[3.6vw] text-ink max-w-4xl"
    >
      {children}
    </motion.blockquote>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-end px-6 md:px-16 pb-16 pt-32">
        <SectionLabel>ABOUT MEDIX</SectionLabel>
        <h1 className="mt-6 font-display uppercase tracking-tight leading-[0.95] text-[13vw] md:text-[7.5vw] text-ink">
          <WordReveal text="Built because 2 AM Google is a terrible doctor." />
        </h1>
      </section>

      {/* Story */}
      <section className="px-6 md:px-16 py-28 border-t border-stone-line">
        <div className="grid md:grid-cols-2 gap-14">
          <SectionLabel>THE STORY</SectionLabel>
          <div className="space-y-8 max-w-xl">
            <Reveal>
              <p className="text-ink leading-relaxed">
                Everyone knows the ritual. A strange ache, a quick search, and
                twenty minutes later you've read yourself into the worst-case
                scenario. Not because you're irrational — because the internet
                answers everyone, and therefore no one.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ink-soft leading-relaxed">
                Meanwhile, the information that could actually calibrate an
                answer — your lab reports, your prescriptions, your history —
                sits scattered across WhatsApp forwards, email attachments and
                a paper folder somewhere at home.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-ink-soft leading-relaxed">
                Medix is one developer's answer to that mess: a single, calm
                system where your health data lives organized and understood,
                and where an AI that knows your context gives you a structured
                first opinion — so your next step is chosen, not panicked into.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="px-6 md:px-16 py-32 overflow-hidden">
        <ParallaxQuote>
          "Not a replacement for your doctor. A replacement for your panic."
        </ParallaxQuote>
      </section>

      {/* Values */}
      <section className="bg-ink text-cream-light px-6 md:px-16 py-32">
        <SectionLabel>WHAT MEDIX BELIEVES</SectionLabel>
        <div className="mt-14 grid gap-y-16 gap-x-14 md:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.n} delay={i * 0.08}>
              <div className="flex items-baseline gap-4">
                <span className="font-mono-accent text-xs text-forest-bright">{v.n}</span>
                <h3 className="font-display uppercase tracking-tight text-2xl md:text-4xl">
                  {v.title}
                </h3>
              </div>
              <p className="mt-4 pl-8 text-stone text-sm leading-relaxed max-w-md">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tech + privacy */}
      <section className="px-6 md:px-16 py-32">
        <div className="grid md:grid-cols-2 gap-14">
          <div>
            <SectionLabel>UNDER THE HOOD</SectionLabel>
            <Reveal>
              <h2 className="mt-6 font-display uppercase tracking-tight leading-[1.0] text-[8vw] md:text-[3.4vw] text-ink">
                Engineered, not vibe-coded.
              </h2>
            </Reveal>
          </div>
          <div className="space-y-6 max-w-xl">
            <Reveal>
              <p className="text-ink-soft leading-relaxed text-sm">
                A Java / Spring Boot backend handles auth (secure HttpOnly
                cookies), records, scheduling and every AI call — the model key
                never touches your browser. PostgreSQL stores the data; the AI
                reads documents via real text extraction, not screenshots.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-ink-soft leading-relaxed text-sm">
                This interface is React with an editorial design system —
                deliberate typography, real scroll choreography, and no
                dark-pattern engagement tricks. The point is to get you an
                answer and let you leave calmer than you arrived.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-6 md:px-16 py-32 border-t border-stone-line">
        <SectionLabel>THE ROADMAP</SectionLabel>
        <div className="mt-14">
          {ROADMAP.map((r, i) => (
            <motion.div
              key={r.when}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
              className="grid md:grid-cols-[140px_1fr_2fr] gap-4 md:gap-10 items-baseline py-8 border-b border-stone-line"
            >
              <span className="font-mono-accent text-xs tracking-widest text-forest">{r.when}</span>
              <h3 className="font-display uppercase tracking-tight text-2xl md:text-3xl text-ink">
                {r.what}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed">{r.detail}</p>
            </motion.div>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-16">
          <PillLink to="/register">Join the journey</PillLink>
        </Reveal>
      </section>
    </>
  );
}
