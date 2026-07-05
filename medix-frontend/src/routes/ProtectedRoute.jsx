import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/components/common/Loader";

/** Gate for authenticated routes. Waits for auth bootstrap before deciding. */
export default function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader label="Loading your health space..." />
      </div>
    );
  }

  if (status !== "authed") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Inverse gate: keep authed users out of login/register. */
export function GuestOnlyRoute() {
  const status = useAuthStore((s) => s.status);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader label="Loading..." />
      </div>
    );
  }

  if (status === "authed") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
