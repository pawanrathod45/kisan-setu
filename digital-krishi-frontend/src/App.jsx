import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/login';
import Register from './pages/Register';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';

// Layout & Common
import DashboardLayout from './components/common/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

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
import CropsPage from './pages/CropsPage';
import TasksPage from './pages/TasksPage';

// Admin Console
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCropsPage from './pages/admin/AdminCropsPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';

// 🔐 Protected Routes
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// 🌐 Global Language Context
import { LanguageProvider } from './context/LanguageContext';

// 📱 Master Responsive Overrides
import './styles/Responsive.css';

function App() {
  return (
    <ErrorBoundary title="Kisan Setu Application">
      <LanguageProvider>
        <BrowserRouter>
          <Routes>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

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
              <Route path="crops" element={<CropsPage />} />
              <Route path="tasks" element={<TasksPage />} />
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

            {/* 🛡️ PROTECTED ADMIN CONSOLE ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute role="admin">
                    <AdminLayout />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="crops" element={<AdminCropsPage />} />
              <Route path="alerts" element={<AdminAlertsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="system" element={<AdminSystemPage />} />
            </Route>

            {/* ❌ Unauthorized fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;