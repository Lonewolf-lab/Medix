import { Outlet } from "react-router-dom";
import PublicNav from "../nav/PublicNav.jsx";
import PublicFooter from "../footer/PublicFooter.jsx";
import SmoothScroll from "./SmoothScroll.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

/** Shell for all public pages: smooth scroll + nav + page + footer. */
export default function PublicLayout() {
  return (
    <div className="bg-cream min-h-screen">
      <SmoothScroll />
      <ScrollToTop />
      <PublicNav />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
