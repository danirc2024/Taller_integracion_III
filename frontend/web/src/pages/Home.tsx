import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="landing">
      <LandingNavbar />
      <LandingHero />
      <LandingTrustStrip />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingSavings />
      <LandingStores />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
