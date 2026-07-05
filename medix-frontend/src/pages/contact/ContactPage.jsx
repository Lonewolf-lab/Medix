import { useState } from "react";
import { motion } from "motion/react";
import SectionLabel from "../../components/common/SectionLabel.jsx";
import Reveal, { WordReveal, EASE } from "../../components/common/Reveal.jsx";

const CONTACT_EMAIL = "sinhasidd27@gmail.com";

const INFO = [
  {
    label: "COLLABORATE",
    text: "Ideas, feedback, or want to build on Medix? The inbox is open.",
  },
  {
    label: "RECRUITING?",
    text: "Medix is a solo full-stack project — Java/Spring backend, React frontend, AI integration. Happy to walk through any of it.",
  },
  {
    label: "FOUND A BUG?",
    text: "Tell me what broke and how — every report makes the system calmer.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // No backend needed: compose a mail in the visitor's own client.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Medix — message from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const inputClass =
    "w-full bg-transparent border-b border-ink-line py-4 text-cream-light placeholder:text-stone/60 focus:outline-none focus:border-forest-bright transition-colors";

  return (
    <div className="bg-ink text-cream-light">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col justify-end px-6 md:px-16 pb-16 pt-32">
        <SectionLabel>CONTACT</SectionLabel>
        <h1 className="mt-6 font-display uppercase tracking-tight leading-[0.95] text-[13vw] md:text-[8vw]">
          <WordReveal text="Get in touch." />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-md text-stone leading-relaxed text-sm">
            Questions about Medix, the tech behind it, or a wild feature idea —
            all welcome. Expect a human reply, not a ticket number.
          </p>
        </Reveal>
      </section>

      {/* Form + info */}
      <section className="px-6 md:px-16 py-24 grid gap-16 md:grid-cols-2 border-t border-ink-line">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div>
            <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2" htmlFor="c-name">
              01 — YOUR NAME
            </label>
            <input
              id="c-name"
              className={inputClass}
              placeholder="Jane Doe"
              value={form.name}
              onChange={update("name")}
              required
            />
          </div>
          <div>
            <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2" htmlFor="c-email">
              02 — YOUR EMAIL
            </label>
            <input
              id="c-email"
              type="email"
              className={inputClass}
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
            />
          </div>
          <div>
            <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2" htmlFor="c-msg">
              03 — YOUR MESSAGE
            </label>
            <textarea
              id="c-msg"
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="What's on your mind?"
              value={form.message}
              onChange={update("message")}
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-fit inline-flex items-center gap-3 rounded-full pl-2 pr-8 py-2.5 bg-forest text-cream-light font-mono-accent text-xs tracking-widest uppercase"
          >
            <span className="w-9 h-9 rounded-full bg-ink flex items-center justify-center text-[10px]">●</span>
            Send message
          </motion.button>
          <p className="font-mono-accent text-[10px] tracking-widest text-stone -mt-4">
            OPENS YOUR EMAIL APP — NOTHING IS STORED HERE.
          </p>
        </form>

        <div className="flex flex-col gap-12">
          {INFO.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.1}>
              <p className="font-mono-accent text-xs tracking-widest text-forest-bright mb-3">
                {item.label}
              </p>
              <p className="text-stone text-sm leading-relaxed max-w-sm">{item.text}</p>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <p className="font-mono-accent text-xs tracking-widest text-forest-bright mb-3">DIRECT</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link-underline font-display uppercase tracking-tight text-2xl md:text-3xl"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex gap-6 mt-8">
              <a
                href="https://github.com/Lonewolf-lab/Medix"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cream-light/80 hover:text-forest-bright transition-colors"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cream-light/80 hover:text-forest-bright transition-colors"
              >
                LinkedIn ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Big statement */}
      <section className="px-6 md:px-16 py-24 border-t border-ink-line overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-display uppercase tracking-tight leading-[0.95] text-[9vw] md:text-[5vw] text-cream-light/90"
        >
          Talk soon<span className="text-forest-bright">.</span>
        </motion.p>
      </section>
    </div>
  );
}
