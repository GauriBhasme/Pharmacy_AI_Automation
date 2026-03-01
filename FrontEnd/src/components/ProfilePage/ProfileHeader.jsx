const ProfileHeader = ({ user }) => {
  return (
    <div className="relative">
      <div className="h-36 bg-gradient-to-r from-[#0E2F5A] via-[#135C8C] to-[#2563EB]"></div>

      <img
        src={user.avatar || "https://via.placeholder.com/150"}
        alt="avatar"
        className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 w-32 h-32 rounded-full border-4 border-[#E5E7EB] shadow-xl object-cover bg-[#1F2937]"
      />
    </div>
  );
};

export default ProfileHeader;
