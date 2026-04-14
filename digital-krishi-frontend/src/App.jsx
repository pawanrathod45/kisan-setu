import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Layout
import DashboardLayout from './components/common/DashboardLayout';

// Feature Pages
import WeatherPage from './pages/WeatherPage';
import MarketPage from './pages/MarketPage';
import AIAssistantPage from './pages/AIAssistantPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import AlertsPage from './pages/AlertsPage';
import CropCalendarPage from './pages/CropCalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// 🔐 Protected Routes
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Backward compatibility */}
        <Route path="/dashboard" element={<Navigate to="/farmer/dashboard" replace />} />

        {/* 🔥 PROTECTED FARMER ROUTES */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute role="farmer">
                <DashboardLayout />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="disease-detection" element={<DiseaseDetectionPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="calendar" element={<CropCalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="voice" element={<VoiceAssistantPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ❌ Unauthorized fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;