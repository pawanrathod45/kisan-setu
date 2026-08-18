import React, { useState, useEffect } from "react";
import profileService from "../services/profileService";
import API from "../services/api";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import "../components/profile/profile.css";

import ConfirmModal from "../components/common/ConfirmModal";

const ProfilePage = () => {
  const [user, setUser]                           = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [editing, setEditing]                     = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tip, setTip]                             = useState(null);
  const [weather, setWeather]                     = useState(null);
  const [market, setMarket]                       = useState(null);
  const [error, setError]                         = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profileService.getProfile();
      const profile = (res.data && (res.data.user || res.data)) || null;
      setUser(profile);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    profileService.getTip().then((r) => setTip(r.data)).catch(() => {});

    if (user.location) {
      API.get(`/weather?city=${user.location}`)
        .then((r) => setWeather(r.data))
        .catch(() => {});
    }

    if (user.crop) {
      API.get(`/market?crop=${user.crop}`)
        .then((r) => setMarket(r.data))
        .catch(() => {});
    }
  }, [user]);

  const handleSave = async (formData, imageFile) => {
    try {
      let payload = { ...formData };

      if (imageFile) {
        const up = await profileService.uploadImage(imageFile);
        payload.profileImage = up.data.url;
      }

      const res = await profileService.updateProfile(payload);
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const toggleNotif = async () => {
    try {
      const res = await profileService.updateProfile({
        notificationsEnabled: !user.notificationsEnabled,
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDark = async () => {
    try {
      const res = await profileService.updateProfile({
        darkMode: !user.darkMode,
      });
      setUser(res.data);
      document.body.classList.toggle("dark-mode", res.data.darkMode);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={fetchProfile} className="ks-btn primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileCard
        user={user}
        tip={tip}
        weather={weather}
        market={market}
        onEdit={() => setEditing(true)}
        onLogout={handleLogout}
        onToggleNotif={toggleNotif}
        onToggleDark={toggleDark}
      />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Kisan Setu?"
        message="Are you sure you want to logout? You can securely sign back in at any time."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <EditProfileModal
        show={editing}
        user={user}
        onClose={() => setEditing(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfilePage; 