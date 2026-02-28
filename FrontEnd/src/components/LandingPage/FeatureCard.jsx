export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#0E2F5A] p-8 rounded-2xl border border-blue-900 hover:scale-105 transition">
      <div className="text-3xl mb-4 text-blue-400">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  );
}