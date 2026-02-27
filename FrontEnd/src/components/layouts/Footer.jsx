export default function Footer() {
  return (
    <footer className="bg-[#041311] border-t border-green-900 text-gray-400 px-8 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div>© 2024 Pharmacy AI</div>

        <div className="flex gap-6 text-sm mt-4 md:mt-0">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>

        <div className="text-sm mt-4 md:mt-0">
          Built for Health-Tech Hackathon 2024
        </div>
      </div>
    </footer>
  );
}