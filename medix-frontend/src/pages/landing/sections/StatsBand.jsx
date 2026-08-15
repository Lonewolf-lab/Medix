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
    <section className="pt-4 pb-16 sm:pt-6 sm:pb-20 md:pt-8 md:pb-24 border-y border-stone-line bg-cream-light/60">
      <Marquee
        items={["AI Triage", "Health Records", "Medications", "AI Chat", "Lab Dashboard"]}
        className="py-4 md:py-6 border-b border-stone-line"
      />
      <div className="px-4 sm:px-6 md:px-16 mt-6 sm:mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-8 md:gap-10">
        {STATS.map((s, i) => (
          <Reveal key={s.n + s.label} delay={i * 0.08}>
            <div className="flex flex-col justify-between h-full p-4 sm:p-0 rounded-2xl bg-cream/80 sm:bg-transparent border border-stone-line/50 sm:border-0 shadow-xs sm:shadow-none">
              <div>
                <p className="font-display text-4xl sm:text-6xl md:text-7xl text-ink leading-none">
                  {s.n}
                </p>
                <p className="mt-2.5 sm:mt-3 font-mono-accent text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase text-forest font-semibold leading-tight">
                  {s.label}
                </p>
              </div>
              <p className="mt-2 sm:mt-2 text-[11px] sm:text-sm text-ink-soft leading-relaxed">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
