import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell, { AuthField, AuthSubmit } from "./AuthShell.jsx";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    bloodGroup: "",
  });
  const [notice, setNotice] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // UI-only for now — the Spring Boot backend gets wired in next phase.
  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice("Registration activates once the backend is connected — coming next.");
  };

  return (
    <AuthShell
      title="Create your space."
      subtitle="A few basics — they become the context every AI answer is calibrated to."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="link-underline text-forest font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <AuthField
          number="01"
          label="FULL NAME"
          placeholder="Jane Doe"
          autoComplete="name"
          value={form.name}
          onChange={update("name")}
          required
        />
        <AuthField
          number="02"
          label="EMAIL"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          required
        />
        <AuthField
          number="03"
          label="PASSWORD"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          value={form.password}
          onChange={update("password")}
          required
        />
        <div className="grid grid-cols-2 gap-8">
          <AuthField
            number="04"
            label="DATE OF BIRTH"
            type="date"
            value={form.dob}
            onChange={update("dob")}
          />
          <div>
            <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2">
              05 — BLOOD GROUP
            </label>
            <select
              value={form.bloodGroup}
              onChange={update("bloodGroup")}
              className="w-full bg-transparent border-b border-stone-line py-3.5 text-ink focus:outline-none focus:border-forest transition-colors"
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        {notice && (
          <p className="font-mono-accent text-[11px] tracking-wide text-forest">{notice}</p>
        )}
        <AuthSubmit>Create account</AuthSubmit>
        <p className="font-mono-accent text-[10px] tracking-widest text-stone -mt-2">
          MEDIX IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.
        </p>
      </form>
    </AuthShell>
  );
}
