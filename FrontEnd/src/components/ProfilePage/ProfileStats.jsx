import React from "react";

const ProfileStats = ({ user }) => {
  return (
    <div className="stats">
      <div>
        <h3>{user.friends}</h3>
        <p>Friends</p>
      </div>
      <div>
        <h3>{user.photos}</h3>
        <p>Photos</p>
      </div>
      <div>
        <h3>{user.comments}</h3>
        <p>Comments</p>
      </div>
    </div>
  );
};

export default ProfileStats;