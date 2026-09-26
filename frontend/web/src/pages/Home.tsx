import "@/styles/Home.css";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingSavings } from "@/components/landing/LandingSavings";
import { LandingStores } from "@/components/landing/LandingStores";
import { LandingTrustStrip } from "@/components/landing/LandingTrustStrip";
import { LandingHowItWorks } from "@/components/landing/LandingWorks";

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