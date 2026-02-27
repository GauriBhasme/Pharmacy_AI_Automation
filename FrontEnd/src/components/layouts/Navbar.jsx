import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#061a17] border-b border-green-900">
      <div className="flex items-center gap-2 text-white font-semibold text-lg">
        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
          🤖
        </div>
        Pharmacy AI
      </div>

      <div className="hidden md:flex gap-8 text-gray-300">
        <a href="#features" className="hover:text-green-400">Features</a>
        <a href="#how" className="hover:text-green-400">How it Works</a>
        <a href="#safety" className="hover:text-green-400">Safety</a>
      </div>

      <div className="flex gap-4">
        <Link to="/login" className="text-gray-300 hover:text-white">
          Login
        </Link>
        <Link
          to="/chat"
          className="bg-blue-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-medium"
        >
          Start Chat
        </Link>
      </div>
    </nav>
  );
}