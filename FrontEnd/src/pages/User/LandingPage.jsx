// import Navbar from "../../components/layouts/Navbar";
import HeroSection from "../../components/LandingPage/HeroSection";
import FeaturesSection from "../../components/LandingPage/FeaturesSection";
import CTASection from "../../components/LandingPage/CTASection";
// import Footer from "../../components/layouts/Footer";

export default function LandingPage() {
  return (
    <div className="bg-[#041311] min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}

