import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell, { AuthField, AuthSubmit } from "./AuthShell.jsx";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // UI-only for now — the Spring Boot backend gets wired in next phase.
  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice("Sign-in activates once the backend is connected — coming next.");
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your Medix health space."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="link-underline text-forest font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <AuthField
          number="01"
          label="EMAIL"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          required
        />
        <AuthField
          number="02"
          label="PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={update("password")}
          required
        />
        {notice && (
          <p className="font-mono-accent text-[11px] tracking-wide text-forest">{notice}</p>
        )}
        <AuthSubmit>Sign in</AuthSubmit>
      </form>
    </AuthShell>
  );
}
