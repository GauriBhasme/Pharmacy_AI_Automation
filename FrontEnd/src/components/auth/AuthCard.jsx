export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md bg-[#112B4A] rounded-2xl shadow-2xl p-8">
      <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
      <p className="text-[#9FB7C8] text-sm mb-6">{subtitle}</p>
      {children}
    </div>
  );
}