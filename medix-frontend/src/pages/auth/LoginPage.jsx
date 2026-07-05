import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import AuthShell, { AuthField, AuthSubmit } from "./AuthShell.jsx";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/dashboard";

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form);
      toast.success("Welcome back to Medix!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
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
          disabled={loading}
        />
        <AuthSubmit disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
