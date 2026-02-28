import React, { useEffect, useState } from "react";
// import { getUserProfile } from "../services/api";
import ProfileCard from "../../components/ProfilePage/ProfileCard";
import Loader from "../../components/ProfilePage/Loader";

import axios from "axios";

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <Loader />;

  return (
    <div className="page-container">
      <ProfileCard user={user} />
    </div>
  );
};

export default ProfilePage;