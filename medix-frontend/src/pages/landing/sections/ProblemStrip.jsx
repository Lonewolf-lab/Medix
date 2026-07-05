import SectionLabel from "../../../components/common/SectionLabel.jsx";
import Reveal, { WordReveal } from "../../../components/common/Reveal.jsx";

export default function ProblemStrip() {
  return (
    <section className="px-6 md:px-16 py-32 md:py-44">
      <SectionLabel>THE PROBLEM</SectionLabel>
      <h2 className="mt-8 font-display uppercase tracking-tight leading-[1.02] text-[8.5vw] md:text-[4.2vw] text-ink max-w-5xl">
        <WordReveal text="You search one symptom. Ten minutes later, the internet has you convinced it's a catastrophe." />
      </h2>
      <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl">
        <Reveal delay={0.05}>
          <p className="text-ink-soft leading-relaxed text-sm">
            Health information online is written for everyone — which means it's
            written for no one. It doesn't know your age, your history, or the
            medication you took this morning.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-ink-soft leading-relaxed text-sm">
            Meanwhile your real records — lab reports, prescriptions,
            vaccinations — are scattered across WhatsApp chats, email
            attachments and paper folders nobody can find.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="text-ink-soft leading-relaxed text-sm">
            Medix replaces that chaos with one calm system: your data, organized
            and understood — and an AI that answers with <em>your</em> context,
            not the internet's worst-case scenario.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
