import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSeedling, FaPlus, FaEdit, FaTrash, FaTimes,
  FaCalendarAlt, FaRuler, FaChartLine, FaFlask, FaCamera,
  FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaUpload, FaSpinner
} from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import API from '../services/api';
import '../styles/Dashboard.css';

import ConfirmModal from '../components/common/ConfirmModal';

/* Growth stage helper */
const getStage = (sowingDate) => {
  if (!sowingDate) return { label: 'Active', color: 'green' };
  const daysOld = Math.floor((Date.now() - new Date(sowingDate)) / 86400000);
  if (daysOld < 0)   return { label: 'Planned',    color: 'blue' };
  if (daysOld < 30)  return { label: 'Germination',color: 'green' };
  if (daysOld < 80)  return { label: 'Growing',    color: 'green' };
  if (daysOld < 120) return { label: 'Maturing',   color: 'amber' };
  return               { label: 'Harvest Ready',   color: 'amber' };
};

const EMPTY_CROP = {
  name: '',
  variety: '',
  area: '',
  sowingDate: new Date().toISOString().split('T')[0],
  imageUrl: '',
  currentPrice: 2450,
  priceTrend: '+2.5% ▲',
  healthStatus: 'Healthy',
  diseaseDetected: 'Healthy Plant',
  appliedPesticides: []
};

const CropsPage = () => {
  const [crops, setCrops]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [current, setCurrent]             = useState(EMPTY_CROP);
  const [saving, setSaving]               = useState(false);
  const [scanningCropId, setScanningCropId] = useState(null);
  const [deleteCropId, setDeleteCropId]   = useState(null);

  // Pesticide application modal state
  const [pesticideModalCrop, setPesticideModalCrop] = useState(null);
  const [newPesticide, setNewPesticide]             = useState({ name: '', dosage: '2 ml / litre of water', type: 'Fungicide / Insecticide' });
  const [savingPesticide, setSavingPesticide]       = useState(false);

  // Card photo upload ref
  const scanInputRef = useRef(null);
  const addImageRef  = useRef(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await API.get('/crops');
      setCrops(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setCurrent(EMPTY_CROP);
    setShowModal(true);
  };

  const openEdit = (crop) => {
    setEditMode(true);
    setCurrent(crop);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrent(EMPTY_CROP);
  };

  const confirmDelete = async () => {
    if (!deleteCropId) return;
    try {
      await API.delete(`/crops/${deleteCropId}`);
      setCrops(c => c.filter(x => x._id !== deleteCropId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteCropId(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteCropId(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMode) {
        await API.put(`/crops/${current._id}`, current);
      } else {
        await API.post('/crops', current);
      }
      closeModal();
      fetchCrops();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── Scan leaf / image for specific crop card ── */
  const triggerScan = (cropId) => {
    setScanningCropId(cropId);
    if (scanInputRef.current) {
      scanInputRef.current.click();
    }
  };

  const handleCardImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !scanningCropId) return;

    const cropId = scanningCropId;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await API.post(`/crops/${cropId}/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCrops(prev => prev.map(c => c._id === cropId ? res.data : c));
      alert(`✅ Scan completed for ${res.data.name}! Diagnosis: ${res.data.diseaseDetected}. Market rate & pesticides updated.`);
    } catch (err) {
      alert('AI scan failed. Please try again.');
    } finally {
      setLoading(false);
      setScanningCropId(null);
      if (scanInputRef.current) scanInputRef.current.value = '';
    }
  };

  /* ── AI Auto-Fill in Add Crop Modal ── */
  const handleModalImageDetect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setSaving(true);
      const res = await API.post('/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCurrent(prev => ({
        ...prev,
        name: res.data.crop || prev.name || 'Wheat',
        variety: `${res.data.crop || 'Crop'} Hybrid-01`,
        imageUrl: res.data.imageUrl || '',
        currentPrice: res.data.currentPrice || 2450,
        priceTrend: res.data.priceTrend || '+2.5% ▲',
        healthStatus: res.data.severity === 'high' ? 'Critical' : res.data.severity === 'medium' ? 'Infected' : 'Healthy',
        diseaseDetected: res.data.disease || 'Healthy Plant',
        appliedPesticides: res.data.pesticides || []
      }));
    } catch (err) {
      console.warn('AI detect fallback:', err);
    } finally {
      setSaving(false);
      if (addImageRef.current) addImageRef.current.value = '';
    }
  };

  /* ── Log applied pesticide ── */
  const handleAddPesticide = async (e) => {
    e.preventDefault();
    if (!pesticideModalCrop || !newPesticide.name) return;

    setSavingPesticide(true);
    try {
      const res = await API.post(`/crops/${pesticideModalCrop._id}/pesticides`, newPesticide);
      setCrops(prev => prev.map(c => c._id === pesticideModalCrop._id ? res.data : c));
      setPesticideModalCrop(null);
      setNewPesticide({ name: '', dosage: '2 ml / litre of water', type: 'Fungicide / Insecticide' });
      alert('🧪 Pesticide spray successfully recorded in crop logs!');
    } catch (err) {
      alert('Failed to log pesticide');
    } finally {
      setSavingPesticide(false);
    }
  };

  return (
    <div className="ks-page" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hidden File Input for Card Scanning */}
      <input
        type="file"
        ref={scanInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleCardImageUpload}
      />

      {/* Page Header */}
      <div className="ks-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="ks-page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="ks-page-header-icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #15803d, #22c55e)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 14px rgba(22,163,74,.3)' }}>
            <FaSeedling />
          </div>
          <div>
            <h1 className="ks-page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              My Crops & Live Market
            </h1>
            <p className="ks-page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>
              {loading ? 'Syncing farm portfolio…' : `Managing ${crops.length} active crop${crops.length !== 1 ? 's' : ''} with live APMC rates & pesticide logs`}
            </p>
          </div>
        </div>

        <button className="ks-btn ks-btn--primary" onClick={openAdd} style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Add New Crop
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ks-accent-card ks-accent-card--red" style={{ color: '#DC2626', fontSize: '.875rem', marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <FaExclamationTriangle className="me-2" /> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="crops-portfolio-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="ks-card" style={{ height: 320, borderRadius: '20px', padding: '20px', background: '#ffffff', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                <div style={{ height: 120, background: '#e2ece3', borderRadius: '12px', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: 24, width: '60%', background: '#e2ece3', borderRadius: '6px' }} />
                <div style={{ height: 18, width: '40%', background: '#e2ece3', borderRadius: '6px' }} />
                <div style={{ height: 40, width: '100%', background: '#e2ece3', borderRadius: '10px', marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crops Grid */}
      {!loading && (
        <div className="crops-portfolio-grid">
          <AnimatePresence>
            {crops.length === 0 && (
              <div className="ks-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                <GiWheat style={{ fontSize: '48px', color: '#15803d', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>No Crops In Your Portfolio Yet</h3>
                <p style={{ color: 'var(--text-light)', maxWidth: '420px', margin: '6px auto 20px' }}>
                  Add your first crop or upload a plant photo to auto-detect market prices and disease protection schedules.
                </p>
                <button className="ks-btn ks-btn--primary" onClick={openAdd}>
                  <FaPlus className="me-2" /> Add First Crop
                </button>
              </div>
            )}

            {crops.map((crop, i) => {
              const stage = getStage(crop.sowingDate);
              const isHealthy = crop.healthStatus === 'Healthy' || !crop.diseaseDetected || crop.diseaseDetected === 'Healthy Plant';

              return (
                <motion.div
                  key={crop._id}
                  className="ks-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .95 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 4px 16px rgba(15,23,42,.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Compact Header Bar */}
                  <div style={{
                    position: 'relative',
                    height: '84px',
                    background: crop.imageUrl
                      ? `url(${crop.imageUrl}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #072712 0%, #0d421f 50%, #155e2d 100%)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 14px'
                  }}>
                    <span style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      🌾 {stage.label}
                    </span>

                    <button
                      onClick={() => triggerScan(crop._id)}
                      title="Scan crop leaf photo for disease & prices"
                      style={{
                        background: '#ffffff',
                        color: '#15803d',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      <FaCamera /> Scan Leaf
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Title & Health Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                          {crop.name}
                        </h3>
                        <p style={{ margin: '1px 0 0', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>
                          {crop.variety || `${crop.name} High-Yield`} • {crop.area || '2.5'} Acres
                        </p>
                      </div>

                      <span style={{
                        background: isHealthy ? '#dcfce7' : '#fee2e2',
                        color: isHealthy ? '#15803d' : '#dc2626',
                        border: `1px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}`,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isHealthy ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {crop.diseaseDetected ? crop.diseaseDetected.slice(0, 16) : (isHealthy ? 'Healthy' : 'Needs Care')}
                      </span>
                    </div>

                    {/* Compact 2-Column Info Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                      {/* Mandi Rate */}
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                            MANDI RATE
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                            ₹{crop.currentPrice || 2450} <span style={{ fontSize: '0.68rem', color: '#64748b' }}>/qtl</span>
                          </div>
                        </div>
                        <span style={{ background: '#22c55e', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 5px', borderRadius: '6px' }}>
                          {crop.priceTrend || '+2.8%'}
                        </span>
                      </div>

                      {/* Sowing Date */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          SOWN ON
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                          {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Nov 2025'}
                        </div>
                      </div>
                    </div>

                    {/* AI Advisory Summary Pill */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2ece3',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      fontSize: '0.73rem',
                      color: '#334155',
                      lineHeight: 1.3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem' }}>✨</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {crop.aiReview ? crop.aiReview.slice(0, 50) + '…' : 'Normal vegetative tillering with optimal leaf canopy.'}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '6px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => setPesticideModalCrop(crop)}
                        style={{
                          flex: 1,
                          background: '#f0fdf4',
                          border: '1px solid #86efac',
                          color: '#15803d',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaFlask /> Sprays
                      </button>

                      <button
                        onClick={() => openEdit(crop)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(crop._id)}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Crop Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCropId}
        title="Delete Crop From Portfolio?"
        message="Are you sure you want to delete this crop? This will also remove associated spray records and price tracking."
        confirmText="Yes, Delete Crop"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCropId(null)}
      />

      {/* Add / Edit Crop Modal with AI Scan */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="ks-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="ks-modal"
              initial={{ opacity: 0, scale: .95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '540px', width: '92%' }}
            >
              <div className="ks-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <h2 className="ks-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  {editMode ? '✏️ Edit Crop Details' : '🌱 Add New Crop to Portfolio'}
                </h2>
                <button className="ks-modal-close" onClick={closeModal}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="ks-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* AI Photo Scan Feature in Modal */}
                  {!editMode && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1.5px dashed #86efac',
                      borderRadius: '14px',
                      padding: '14px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
                        📸 Quick AI Auto-Fill via Leaf/Crop Photo
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                        Upload a photo to automatically identify crop, fetch live Mandi prices & pesticide prescriptions!
                      </p>
                      <button
                        type="button"
                        onClick={() => addImageRef.current?.click()}
                        style={{
                          background: '#15803d',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaUpload /> Select Crop Photo
                      </button>
                      <input
                        type="file"
                        ref={addImageRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleModalImageDetect}
                      />
                    </div>
                  )}

                  <div className="ks-input-group">
                    <label className="ks-form-label">Crop Name *</label>
                    <input
                      className="ks-input"
                      type="text"
                      placeholder="e.g., Wheat, Rice, Cotton, Tomato, Soybean"
                      value={current.name}
                      onChange={e => setCurrent({ ...current, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Variety / Hybrid</label>
                    <input
                      className="ks-input"
                      type="text"
                      placeholder="e.g., HD-2967, Basmati 1121, BT Cotton"
                      value={current.variety}
                      onChange={e => setCurrent({ ...current, variety: e.target.value })}
                    />
                  </div>

                  <div className="ks-grid--2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="ks-input-group">
                      <label className="ks-form-label">Area (acres) *</label>
                      <input
                        className="ks-input"
                        type="number"
                        placeholder="e.g., 5"
                        min="0.1"
                        step="0.1"
                        value={current.area}
                        onChange={e => setCurrent({ ...current, area: e.target.value })}
                        required
                      />
                    </div>
                    <div className="ks-input-group">
                      <label className="ks-form-label">Sowing Date *</label>
                      <input
                        className="ks-input"
                        type="date"
                        value={current.sowingDate ? current.sowingDate.split('T')[0] : ''}
                        onChange={e => setCurrent({ ...current, sowingDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Market Price & Status Overview */}
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                      Current Live APMC Rate:
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803d' }}>
                      ₹{current.currentPrice || 2450} / quintal
                    </span>
                  </div>
                </div>

                <div className="ks-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="ks-btn ks-btn--ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="ks-btn ks-btn--primary" disabled={saving}>
                    {saving ? <><FaSpinner className="fa-spin me-1" /> Saving…</> : editMode ? 'Update Crop' : 'Add to My Crops'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Pesticide Application Modal */}
      <AnimatePresence>
        {pesticideModalCrop && (
          <motion.div
            className="ks-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPesticideModalCrop(null)}
          >
            <motion.div
              className="ks-modal"
              initial={{ opacity: 0, scale: .95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '480px', width: '92%' }}
            >
              <div className="ks-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <h2 className="ks-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  🧪 Record Pesticide Spray: {pesticideModalCrop.name}
                </h2>
                <button className="ks-modal-close" onClick={() => setPesticideModalCrop(null)}><FaTimes /></button>
              </div>

              <form onSubmit={handleAddPesticide}>
                <div className="ks-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ks-input-group">
                    <label className="ks-form-label">Pesticide / Fungicide Name *</label>
                    <input
                      className="ks-input"
                      type="text"
                      placeholder="e.g., Mancozeb 75% WP, Neem Oil 1500 PPM"
                      value={newPesticide.name}
                      onChange={e => setNewPesticide({ ...newPesticide, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Dosage & Mixing Ratio *</label>
                    <input
                      className="ks-input"
                      type="text"
                      placeholder="e.g., 2 g / litre of water"
                      value={newPesticide.dosage}
                      onChange={e => setNewPesticide({ ...newPesticide, dosage: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ks-input-group">
                    <label className="ks-form-label">Treatment Category</label>
                    <select
                      className="ks-input"
                      value={newPesticide.type}
                      onChange={e => setNewPesticide({ ...newPesticide, type: e.target.value })}
                    >
                      <option value="Fungicide (Blight & Rust)">Fungicide (Blight & Rust)</option>
                      <option value="Insecticide (Borer & Aphids)">Insecticide (Borer & Aphids)</option>
                      <option value="Bio-Pesticide (Organic Shield)">Bio-Pesticide (Organic Shield)</option>
                      <option value="Micronutrient Foliar Spray">Micronutrient Foliar Spray</option>
                    </select>
                  </div>
                </div>

                <div className="ks-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="ks-btn ks-btn--ghost" onClick={() => setPesticideModalCrop(null)}>Cancel</button>
                  <button type="submit" className="ks-btn ks-btn--primary" disabled={savingPesticide}>
                    {savingPesticide ? 'Saving Spray Log…' : 'Record Spray Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropsPage;
