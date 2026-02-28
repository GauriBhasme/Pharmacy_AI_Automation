import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-8 py-20 bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-blue-400">
          Intelligent Pharmacy Features
        </h2>
        <p className="text-blue-200 mb-12">
          Our autonomous system ensures your health is managed with precision,
          speed, and uncompromising care.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="💬"
            title="Conversational Ordering"
            description="Simply talk or type to order medications. No complex forms, just natural dialogue."
          />
          <FeatureCard
            icon="🔔"
            title="Predictive Refill Alerts"
            description="Learns your schedule and proactively notifies you before running out."
          />
          <FeatureCard
            icon="🛡️"
            title="Safety Enforcement"
            description="Autonomous checks for interactions and prescription validity."
          />
        </div>
      </div>
    </section>
  );
}