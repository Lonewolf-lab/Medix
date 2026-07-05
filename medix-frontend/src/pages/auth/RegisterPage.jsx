import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
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
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clean up empty optional fields
    const payload = {
      ...form,
      dob: form.dob || null,
      bloodGroup: form.bloodGroup || null,
    };

    try {
      await register(payload);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />
        <div className="grid grid-cols-2 gap-8">
          <AuthField
            number="04"
            label="DATE OF BIRTH"
            type="date"
            value={form.dob}
            onChange={update("dob")}
            disabled={loading}
          />
          <div>
            <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2">
              05 — BLOOD GROUP
            </label>
            <select
              value={form.bloodGroup}
              onChange={update("bloodGroup")}
              disabled={loading}
              className="w-full bg-transparent border-b border-stone-line py-3.5 text-ink focus:outline-none focus:border-forest transition-colors"
            >
              <option value="" className="bg-cream text-ink">Select</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g} className="bg-cream text-ink">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <AuthSubmit disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </AuthSubmit>
        <p className="font-mono-accent text-[10px] tracking-widest text-stone -mt-2">
          MEDIX IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.
        </p>
      </form>
    </AuthShell>
  );
}
