import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileCard from "../../components/ProfilePage/ProfileCard";
import Loader from "../../components/ProfilePage/Loader";

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "http://localhost:5000/api/user/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );

  return response.data;
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        setError("Failed to load profile.");
      }
    };

    fetchUser();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4">
        <h2 className="text-red-400 text-xl font-semibold">{error}</h2>
      </div>
    );
  }

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1220] via-[#0B1730] to-[#0B1220]">
      <div className="flex justify-center items-center py-16 px-4">
        <ProfileCard user={user} />
      </div>
    </div>
  );
};

export default ProfilePage;
