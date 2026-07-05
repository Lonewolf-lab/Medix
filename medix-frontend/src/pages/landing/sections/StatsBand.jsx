import Marquee from "../../../components/common/Marquee.jsx";
import Reveal from "../../../components/common/Reveal.jsx";

const STATS = [
  { n: "05", label: "AI modules working for you", note: "Triage · Records · Meds · Chat · Labs" },
  { n: "24/7", label: "Always-on assistant", note: "No waiting rooms, no appointments to ask a question" },
  { n: "01", label: "Place for everything", note: "Records, prescriptions, biomarkers — one archive" },
  { n: "100%", label: "Yours", note: "Your data stays in your account — no ads, no resale" },
];

export default function StatsBand() {
  return (
    <section className="py-24 border-y border-stone-line bg-cream-light/60">
      <Marquee
        items={["AI Triage", "Health Records", "Medications", "AI Chat", "Lab Dashboard"]}
        className="py-6 border-b border-stone-line"
      />
      <div className="px-6 md:px-16 mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.n + s.label} delay={i * 0.08}>
            <p className="font-display text-6xl md:text-7xl text-ink leading-none">
              {s.n}
            </p>
            <p className="mt-3 font-mono-accent text-xs tracking-widest uppercase text-forest">
              {s.label}
            </p>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
