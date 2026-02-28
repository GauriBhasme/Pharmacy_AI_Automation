export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] border-t border-blue-900 text-blue-200 px-8 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div>© 2026 Pharmacy AI</div>

        <div className="flex gap-6 text-sm mt-4 md:mt-0">
          <a href="#" className="hover:text-blue-400">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400">Terms of Service</a>
          <a href="#" className="hover:text-blue-400">Contact Support</a>
        </div>

        <div className="text-sm mt-4 md:mt-0">
          Built for Health-Tech Hackathon 2024
        </div>
      </div>
    </footer>
  );
}