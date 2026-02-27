export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] flex flex-col items-center justify-center px-4">

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#135C8C] flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">+</span>
        </div>
        <h1 className="text-white text-2xl font-semibold mt-4">
          Pharmacy AI
        </h1>
        <p className="text-[#9FB7C8] text-sm">
          Intelligence for modern healthcare
        </p>
      </div>

      {children}

      {/* Footer */}
      <div className="mt-10 text-[#5F8FA8] text-xs flex gap-6">
        <span className="cursor-pointer hover:text-white">SECURITY</span>
        <span className="cursor-pointer hover:text-white">PRIVACY</span>
        <span className="cursor-pointer hover:text-white">SUPPORT</span>
      </div>
    </div>
  );
}