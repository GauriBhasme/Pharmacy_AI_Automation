import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ActionButtons from "./ActionButtons";

const ProfileCard = ({ user }) => {
  return (
    <div className="profile-card">
      <ProfileHeader user={user} />
      <ActionButtons />

      <div className="profile-info">
        <h1>{user.name}</h1>
        <p>{user.location}</p>
        <p>{user.role}</p>
        <p>{user.education}</p>

        <ProfileStats user={user} />

        <button className="show-more">Show more</button>
      </div>
    </div>
  );
};

export default ProfileCard;