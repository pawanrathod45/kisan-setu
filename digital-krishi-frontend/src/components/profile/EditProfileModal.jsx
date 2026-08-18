import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaCamera, FaTimes, FaSave, FaSeedling, FaMapMarkerAlt, FaPhone, FaGlobe } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const EditProfileModal = ({ show, user, onClose, onSave }) => {
  const [form, setForm]                 = useState({});
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        crop: user.crop || '',
        landArea: user.landArea || '',
        farmingType: user.farmingType || 'traditional',
        language: user.language || 'en',
        bio: user.bio || '',
      });
      setImagePreview(user.profileImage || null);
      setImageFile(null);
    }
  }, [user, show]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, imageFile);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'KI';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="ks-modal-backdrop" onClick={onClose} style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(8px)' }}>
      <div 
        className="ks-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
          width: '100%', 
          borderRadius: '24px', 
          background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid #e2ece3',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '18px 24px', 
          borderBottom: '1.5px solid #f1f5f9', 
          background: '#f8fafc',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaUserEdit />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Edit Farm Profile
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Update your farmer identity, crop acreage, and district
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: '#ffffff', 
              border: '1.5px solid #e2e8f0', 
              color: '#64748b', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Avatar Uploader Section */}
            <div style={{ 
              background: '#f0fdf4', 
              border: '1.5px solid #bbf7d0', 
              borderRadius: '16px', 
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px'
            }}>
              <div style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '18px', 
                overflow: 'hidden', 
                border: '2.5px solid #86efac', 
                background: '#ffffff',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: '#15803d'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(form.name)
                )}
              </div>

              <div>
                <label style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #86efac', 
                  color: '#15803d', 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}>
                  <FaCamera /> Choose New Profile Photo
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                </label>
                <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Supports JPG, PNG or WEBP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Section 1: Personal Details */}
            <div>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#15803d', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                borderBottom: '1.5px solid #e2ece3',
                paddingBottom: '6px'
              }}>
                Personal Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Enter your name"
                    required
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    placeholder="Enter 10-digit number"
                    required
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Farm Location / District
                  </label>
                  <input 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    placeholder="e.g. Haveli, Pune"
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Preferred Dialect
                  </label>
                  <select 
                    name="language" 
                    value={form.language} 
                    onChange={handleChange}
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  >
                    <option value="en">English (India)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Agronomy & Land Details */}
            <div>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#15803d', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                borderBottom: '1.5px solid #e2ece3',
                paddingBottom: '6px'
              }}>
                Agronomy & Land Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Primary Crop
                  </label>
                  <input 
                    name="crop" 
                    value={form.crop} 
                    onChange={handleChange} 
                    placeholder="e.g. Rice, Wheat, Cotton"
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Total Land Holding (Acres)
                  </label>
                  <input 
                    name="landArea" 
                    type="number" 
                    value={form.landArea} 
                    onChange={handleChange} 
                    placeholder="e.g. 4.5"
                    min="0"
                    step="0.1"
                    style={{ 
                      width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                      background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Farming Method
                  </label>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="farmingType" 
                        value="traditional" 
                        checked={form.farmingType === 'traditional'} 
                        onChange={handleChange} 
                        style={{ accentColor: '#15803d', width: '16px', height: '16px' }}
                      />
                      <span>Commercial / Traditional</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="farmingType" 
                        value="organic" 
                        checked={form.farmingType === 'organic'} 
                        onChange={handleChange} 
                        style={{ accentColor: '#15803d', width: '16px', height: '16px' }}
                      />
                      <span>Certified Organic</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Farm Notes & Soil Details
              </label>
              <textarea 
                name="bio" 
                value={form.bio} 
                onChange={handleChange} 
                placeholder="Share details about your soil type, irrigation channels, or seed varieties..."
                rows="3"
                style={{ 
                  width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', 
                  background: '#f8fafc', fontSize: '14px', color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                }}
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ 
            padding: '16px 24px 20px', 
            borderTop: '1.5px solid #f1f5f9', 
            background: '#ffffff', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            flexShrink: 0
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving}
              style={{ 
                background: '#f8fafc', 
                border: '1.5px solid #cbd5e1', 
                color: '#475569', 
                padding: '10px 20px', 
                borderRadius: '12px', 
                fontSize: '13.5px', 
                fontWeight: 700, 
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                background: 'linear-gradient(135deg, #155e2d 0%, #16a34a 100%)', 
                color: '#ffffff', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: '12px', 
                fontSize: '13.5px', 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(21, 94, 45, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaSave />
              <span>{saving ? 'Saving Changes…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;