export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#0b221e] p-8 rounded-2xl border border-green-900 hover:scale-105 transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}