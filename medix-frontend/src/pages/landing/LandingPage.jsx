import Hero from "./sections/Hero.jsx";
import ProblemStrip from "./sections/ProblemStrip.jsx";
import FeaturesScroller from "./sections/FeaturesScroller.jsx";
import HowItWorks from "./sections/HowItWorks.jsx";
import StatsBand from "./sections/StatsBand.jsx";
import Faq from "./sections/Faq.jsx";
import FinalCta from "./sections/FinalCta.jsx";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProblemStrip />
      <FeaturesScroller />
      <StatsBand />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}
