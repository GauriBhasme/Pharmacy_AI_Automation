const Navbar = () => {
  return (
    <div className="w-full bg-white/30 backdrop-blur-md shadow-md px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-purple-700">
        PharmaCare
      </h1>

      <div className="flex gap-4">
        <button className="px-4 py-2 rounded-full bg-white shadow hover:shadow-lg transition">
          Dashboard
        </button>

        <button className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow hover:scale-105 transition">
          Edit Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="px-4 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;