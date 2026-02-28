import {Link} from "react-router-dom";
export default function HeroSection() {
  return (
    <section className="px-8 py-20 bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] text-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <span className="text-blue-400 text-sm bg-blue-900/30 px-4 py-1 rounded-full">
            NEXT-GEN AGENTIC HEALTH
          </span>
          <h1 className="text-5xl font-bold mt-6 leading-tight">
            Your Autonomous <br />
            <span className="text-blue-400">AI Pharmacist</span>
          </h1>
          <p className="text-blue-200 mt-6 text-lg">
            Experience the future of healthcare with intelligent medicine
            ordering, predictive refills, and autonomous safety enforcement.
          </p>
          <div className="flex gap-4 mt-8">
              <Link to="/chat" className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-3 rounded-xl font-medium">
            Start Chat →
          </Link>
            <Link to="/login" className="border border-blue-500 px-6 py-3 rounded-xl text-blue-400 hover:bg-blue-500 hover:text-black">
              Get Started
            </Link>
          </div>
          <p className="mt-8 text-sm text-blue-200">
            5,000+ prescriptions managed autonomously this month
          </p>
        </div>
        {/* Right Image Card */}
        <div className="bg-[#0E2F5A] p-6 rounded-3xl border border-blue-900 shadow-xl">
          <img
            src="/hero-image.png"
            alt="AI Pharmacist"
            className="rounded-2xl"
          />
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-200">
              <span>PRESCRIPTION ANALYSIS</span>
              <span>Live Process</span>
            </div>
            <div className="h-2 bg-blue-900 rounded-full mt-2">
              <div className="h-2 bg-blue-500 w-4/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}