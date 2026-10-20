import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import SectionLabel from "../../components/common/SectionLabel.jsx";
import { ShieldCheck, Lock, EyeOff, Server, Calendar, RefreshCw } from "lucide-react";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream text-ink px-5 sm:px-8 md:px-16 pt-32 pb-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4 border-b border-stone-line/60 pb-8">
          <SectionLabel>DATA PROTECTION & PRIVACY</SectionLabel>
          <h1 className="font-display uppercase tracking-tight text-3xl sm:text-5xl md:text-6xl text-ink leading-tight">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-accent text-stone">
            <span>EFFECTIVE DATE: OCTOBER 20, 2026</span>
            <span>•</span>
            <span>VERSION 1.2</span>
          </div>
        </header>

        {/* Core Privacy Promise Callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-2xl bg-forest/10 border-2 border-forest/30 space-y-3"
        >
          <div className="flex items-center gap-2.5 text-forest font-mono-accent text-xs tracking-wider uppercase font-semibold">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span>OUR FUNDAMENTAL DATA COMMITMENT</span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-sans">
            At Medix, we believe your personal health records, symptom queries, and medication schedules belong solely to you.{" "}
            <strong>We do not sell, rent, or monetize your health data or Google account information to data brokers, advertisers, or insurance companies.</strong>{" "}
            All data processing exists exclusively to deliver intelligent, confidential health organization and exact-time alarms for your daily wellness.
          </p>
        </motion.div>

        {/* Content Sections */}
        <article className="space-y-10 text-xs sm:text-sm text-ink-soft leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">01.</span> Information We Collect
            </h2>
            <p>
              We collect information that you directly provide when using the platform, as well as necessary technical metadata:
            </p>
            <div className="space-y-2.5 pl-2">
              <div className="p-3.5 rounded-xl bg-cream-light border border-stone-line/60">
                <span className="font-semibold text-ink block text-xs mb-1">A. Account & Profile Information</span>
                <span className="text-ink-soft text-xs block">
                  Name, email address, salted bcrypt password hash, date of birth, blood group, and account registration timestamps.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-cream-light border border-stone-line/60">
                <span className="font-semibold text-ink block text-xs mb-1">B. Health & Medical Data</span>
                <span className="text-ink-soft text-xs block">
                  Symptom descriptions, triage conversation transcripts, medication names, dosages, frequencies, scheduled times, doctor appointments, notes, and uploaded health documents (lab reports, prescriptions, scans).
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-cream-light border border-stone-line/60">
                <span className="font-semibold text-ink block text-xs mb-1">C. Google OAuth & Calendar Data</span>
                <span className="text-ink-soft text-xs block">
                  When you sign in with Google or connect Google Calendar, we receive OAuth tokens, email address, name, and calendar write access to sync medication schedules and doctor visits as authorized by you.
                </span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">02.</span> Google API Services User Data Policy Compliance
            </h2>
            <div className="p-4 rounded-xl bg-forest/5 border border-forest/20 space-y-2">
              <p className="font-medium text-ink text-xs">
                <strong>Google Limited Use Disclosure:</strong>
              </p>
              <p className="text-xs text-ink-soft leading-relaxed">
                Medix&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest underline font-semibold hover:text-forest-bright"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Calendar Scopes:</strong> We request <code className="bg-cream-light px-1 py-0.5 rounded text-ink border border-stone-line text-[11px]">https://www.googleapis.com/auth/calendar.events</code> solely to insert, update, or remove your Medix medication alarms and doctor consultations from your primary calendar.
              </li>
              <li>
                <strong>No Data Monetization:</strong> We do not sell your Google data to third parties, advertising networks, or data brokers.
              </li>
              <li>
                <strong>No Advertising:</strong> Google user data is never used to serve targeted, contextual, or personalized advertisements.
              </li>
              <li>
                <strong>Human Access Restrictions:</strong> No human employees or contractors read your Google Calendar data unless required to resolve a technical error with your explicit written consent, or to comply with law.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">03.</span> How We Process Health Data & AI
            </h2>
            <p>
              To power the interactive symptom checker, conversational AI agent, and report document analyzers, your queries are processed through high-security backend endpoints:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>No Public Model Training:</strong> Your health records and conversations are not used to train or retrain public foundation models (such as commercial Groq or Google Gemini models).
              </li>
              <li>
                <strong>Zero-Knowledge Context:</strong> AI inferences are conducted with strictly de-identified metadata context to produce accurate, safe informational triage.
              </li>
              <li>
                <strong>Ephemeral Processing:</strong> Once an AI scan or chat response is completed, inference context is retained only within your private account history.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">04.</span> Data Security & Architecture
            </h2>
            <p>
              We implement industry-grade technical and organizational safeguards designed to secure your sensitive health records:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Encryption in Transit:</strong> All web traffic and API calls are enforced via modern TLS 1.3 / HTTPS encryption.
              </li>
              <li>
                <strong>Storage Security:</strong> Passwords are one-way hashed using high-cost bcrypt rounds. User identification tokens utilize cryptographically signed JWT cookies with <code className="text-forest">HttpOnly</code>, <code className="text-forest">SameSite</code>, and strict origin guards.
              </li>
              <li>
                <strong>Rate Limiting & Threat Protection:</strong> Token bucket rate limiters prevent brute-force login attempts and automated scraping.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">05.</span> Your Rights & Data Portability
            </h2>
            <p>
              Regardless of your geographical location, Medix grants you full ownership and control over your health information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right to Access:</strong> You can view all records, medications, and appointment history within your dashboard at any time.</li>
              <li><strong>Right to Rectification:</strong> You can edit inaccurate medical profile information, medication timings, or appointments directly.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request permanent deletion of your account and all associated health records, symptom logs, and calendar linkages by contacting support or navigating to your Profile settings.</li>
              <li><strong>Right to Disconnect:</strong> You can unlink Google Calendar with one click from the Health Calendar page.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">06.</span> Children&rsquo;s Privacy
            </h2>
            <p>
              Medix is not directed to individuals under the age of 18 (or 13 where local law allows parental management). We do not knowingly collect personal information from children without verified parental consent. If we become aware that personal data of a minor has been collected without parental consent, we will take immediate steps to delete such records.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display uppercase text-lg sm:text-xl text-ink tracking-tight flex items-center gap-2">
              <span className="font-mono-accent text-forest text-sm">07.</span> Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your personal health data is handled, please contact our Data Protection Officer:
            </p>
            <div className="p-4 rounded-xl bg-cream-light border border-stone-line/70 space-y-1">
              <p className="font-mono-accent text-xs font-semibold text-ink">PRIVACY & DATA PROTECTION OFFICER:</p>
              <p className="text-xs">Medix Global Operations</p>
              <p className="text-xs">Email: <a href="mailto:support@medix.care" className="text-forest underline">support@medix.care</a></p>
              <p className="text-xs">Developer Contact: <a href="mailto:8468995495kish@gmail.com" className="text-forest underline">8468995495kish@gmail.com</a></p>
              <p className="text-xs">Physical Address / Headquarters: New Delhi, India</p>
            </div>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-stone-line/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/terms"
            className="text-xs font-mono-accent uppercase tracking-wider text-forest hover:text-forest-bright transition-colors flex items-center gap-1.5"
          >
            <span>Read our Terms of Service</span> →
          </Link>
          <Link
            to="/register"
            className="text-xs font-mono-accent uppercase tracking-wider text-stone hover:text-ink transition-colors"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
