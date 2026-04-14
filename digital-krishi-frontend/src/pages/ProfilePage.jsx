import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/Dashboard.css';

const getStoredUser = () => JSON.parse(localStorage.getItem('user') || '{}');

const ProfilePage = () => {
  const [user, setUser] = useState(getStoredUser());
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    crop: '',
  });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      crop: user.crop || '',
    });
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updated = { ...user, ...form };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setIsEditing(false);
    setSaveMessage('Profile updated. You can connect a backend API here later.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleCancel = () => {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      crop: user.crop || '',
    });
    setIsEditing(false);
  };

  return (
    <Container fluid className="dashboard-page">
      <div className="info-card profile-page-card">
        <div className="profile-page-header">
          <h3>Your profile</h3>
          {!isEditing ? (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={() => setIsEditing(true)}
              aria-label="Edit profile"
            >
              <FaEdit /> Edit profile
            </button>
          ) : (
            <div className="profile-form-actions profile-form-actions-inline">
              <button type="button" className="profile-save-btn" onClick={handleSave}>
                <FaSave /> Save
              </button>
              <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
        <p className="profile-page-desc">
          These details personalise weather, crop and market intelligence for you. You can edit
          them below; later we can sync with your backend.
        </p>
        {saveMessage && <p className="profile-save-message">{saveMessage}</p>}

        {!isEditing ? (
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-icon">👤</span>
              <div>
                <span className="detail-label">Name</span>
                <span className="detail-value">{user.name || 'Not set'}</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📱</span>
              <div>
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone || 'Not set'}</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div>
                <span className="detail-label">Location</span>
                <span className="detail-value">{user.location || 'Not set'}</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🌾</span>
              <div>
                <span className="detail-label">Main crop</span>
                <span className="detail-value">{user.crop || 'Not set'}</span>
              </div>
            </div>
          </div>
        ) : (
          <form className="profile-edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="profile-form-group">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="profile-form-input"
                placeholder="Your full name"
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="profile-phone">Phone</label>
              <input
                id="profile-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="profile-form-input"
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="profile-location">Location</label>
              <input
                id="profile-location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="profile-form-input"
                placeholder="Village / District / State"
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="profile-crop">Main crop</label>
              <input
                id="profile-crop"
                type="text"
                name="crop"
                value={form.crop}
                onChange={handleChange}
                className="profile-form-input"
                placeholder="e.g. Wheat, Paddy, Cotton"
              />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="profile-save-btn">
                <FaSave /> Save changes
              </button>
              <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
};

export default ProfilePage;
