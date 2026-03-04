"use client";

import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import DashboardPreview from "@/components/DashboardPreview";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StrategiesSection from "@/components/StrategiesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <LandingNavbar />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <HowItWorksSection />
      <StrategiesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
