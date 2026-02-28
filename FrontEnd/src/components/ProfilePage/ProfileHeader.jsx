import React from "react";

const ProfileHeader = ({ user }) => {
  return (
    <div className="profile-header">
      <div className="gradient-bg"></div>
      <img src={user.avatar} alt="avatar" className="avatar" />
    </div>
  );
};

export default ProfileHeader;