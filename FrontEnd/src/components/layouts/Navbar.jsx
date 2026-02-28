import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]); // updates automatically on route change

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] border-b border-blue-900">
      
      {/* Logo */}
      <div className="flex items-center gap-2 text-white font-semibold text-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
          🤖
        </div>
        Pharmacy AI
      </div>

      {/* Middle Links */}
      <div className="hidden md:flex gap-8 text-gray-300">
        <a href="#features" className="hover:text-blue-400">Features</a>
        <a href="#how" className="hover:text-blue-400">How it Works</a>
        <a href="#safety" className="hover:text-blue-400">Safety</a>
      </div>

      {/* Right Section */}
      <div className="flex gap-4 items-center">

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="text-white hover:text-blue-400">
              Login
            </Link>

            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg font-medium"
            >
              Start Chat
            </Link>
          </>
        ) : (
          <>
            {/* Start Chat still available */}
            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg font-medium"
            >
              Start Chat
            </Link>

            {/* Profile Icon */}
            <Link
              to="/profile"
              className="p-2 rounded-full hover:bg-[#135C8C]"
              title="Profile"
            >
              <User className="h-5 w-5 text-[#9FB7C8]" />
            </Link>

            {/* Logout Icon */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-[#135C8C]"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-[#9FB7C8]" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}