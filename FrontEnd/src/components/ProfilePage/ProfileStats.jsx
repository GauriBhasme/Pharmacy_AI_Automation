const ProfileStats = ({ user }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-8 border-t border-[#1F2937] pt-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#14B8A6]">
          {user.orders || 0}
        </h3>
        <p className="text-[#9CA3AF] text-sm">Orders</p>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-[#14B8A6]">
          {user.prescriptions || 0}
        </h3>
        <p className="text-[#9CA3AF] text-sm">Prescriptions</p>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-[#14B8A6]">
          {user.points || 0}
        </h3>
        <p className="text-[#9CA3AF] text-sm">Points</p>
      </div>
    </div>
  );
};

export default ProfileStats;
