import React from "react";

const ProfileCard = ({ user, onEdit, onLogout, onToggleNotif, onToggleDark }) => {
  if (!user) return null;

  const fields = ["name","phone","location","crop","landArea","farmingType"];
  const filled = fields.filter(f => user[f]).length;
  const completion = Math.round((filled / fields.length) * 100);

  return (
    <div className="profile-card">

      {/* HEADER */}
      <div className="profile-header">
        <img src={user.profileImage || "https://via.placeholder.com/80"} />
        <h2>{user.name}</h2>
        <p>{user.phone}</p>
      </div>

      {/* INFO */}
      <div className="profile-info">
        <div>📍 {user.location}</div>
        <div>🌾 {user.crop}</div>
        <div>📏 {user.landArea} acres</div>
        <div>🌱 {user.farmingType}</div>
      </div>

      {/* PROGRESS */}
      <div className="progress">
        <p>{completion}% Complete</p>
        <div className="bar">
          <div style={{ width: `${completion}%` }}></div>
        </div>
      </div>

      {/* ACTIONS */}
      <button onClick={onEdit}>Edit Profile</button>

      <div>
        Notifications
        <input type="checkbox" checked={user.notificationsEnabled} onChange={onToggleNotif} />
      </div>

      <div>
        Dark Mode
        <input type="checkbox" checked={user.darkMode} onChange={onToggleDark} />
      </div>

      <button className="logout" onClick={onLogout}>Logout</button>

    </div>
  );
};

export default ProfileCard;