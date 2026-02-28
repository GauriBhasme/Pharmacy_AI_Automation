// import Navbar from "../../components/layouts/Navbar";
import HeroSection from "../../components/LandingPage/HeroSection";
import FeaturesSection from "../../components/LandingPage/FeaturesSection";
import CTASection from "../../components/LandingPage/CTASection";
// import Footer from "../../components/layouts/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}

