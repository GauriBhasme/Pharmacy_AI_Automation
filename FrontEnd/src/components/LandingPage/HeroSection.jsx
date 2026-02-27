export default function HeroSection() {
  return (
    <section className="px-8 py-20 bg-gradient-to-br from-[#061a17] to-[#041311] text-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div>
          <span className="text-green-400 text-sm bg-green-900/30 px-4 py-1 rounded-full">
            NEXT-GEN AGENTIC HEALTH
          </span>

          <h1 className="text-5xl font-bold mt-6 leading-tight">
            Your Autonomous <br />
            <span className="text-green-400">AI Pharmacist</span>
          </h1>

          <p className="text-gray-400 mt-6 text-lg">
            Experience the future of healthcare with intelligent medicine
            ordering, predictive refills, and autonomous safety enforcement.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-medium">
              Start Chat →
            </button>
            <button className="border border-green-500 px-6 py-3 rounded-xl text-green-400 hover:bg-green-500 hover:text-black">
              View Dashboard
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            5,000+ prescriptions managed autonomously this month
          </p>
        </div>

        {/* Right Image Card */}
        <div className="bg-[#0c2420] p-6 rounded-3xl border border-green-900 shadow-xl">
          <img
            src="/hero-image.png"
            alt="AI Pharmacist"
            className="rounded-2xl"
          />

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>PRESCRIPTION ANALYSIS</span>
              <span>Live Process</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full mt-2">
              <div className="h-2 bg-green-500 w-4/5 rounded-full"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}