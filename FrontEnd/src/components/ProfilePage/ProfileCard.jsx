import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";

const ProfileCard = ({ user }) => {
  const displayName = user?.username || user?.name || "User";
  const displayRole = user?.role || "Pharmacy User";

  return (
    <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-3xl shadow-2xl overflow-hidden transition hover:border-[#2563EB]">

      <ProfileHeader user={user} />

      <div className="pt-20 px-8 pb-8 text-center">
        <h2 className="text-2xl font-bold text-[#E5E7EB]">
          {displayName}
        </h2>

        <p className="text-[#14B8A6] font-medium mt-1">
          {displayRole}
        </p>

        <p className="text-[#9CA3AF] text-sm">
          {user.email}
        </p>

        <p className="text-[#9CA3AF] text-sm mt-2">
          Total Spent: <span className="text-[#E5E7EB] font-semibold">Rs {Number(user.total_spent || 0).toFixed(2)}</span>
        </p>

        <ProfileStats user={user} />

        {Array.isArray(user.recentOrders) && user.recentOrders.length > 0 ? (
          <div className="mt-6 border-t border-[#1F2937] pt-4 text-left">
            <p className="text-[#E5E7EB] text-sm font-semibold mb-2">Recent Orders</p>
            <div className="space-y-2">
              {user.recentOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id || order.order_id}
                  className="flex items-center justify-between text-xs bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2"
                >
                  <span className="text-[#9CA3AF]">{order.medicine_name || `Medicine #${order.medicine_id}`}</span>
                  <span className="text-[#E5E7EB]">x{order.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button className="mt-6 w-full py-3 rounded-full bg-[#2563EB] text-white font-semibold shadow-md hover:bg-[#1D4ED8] transition">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
