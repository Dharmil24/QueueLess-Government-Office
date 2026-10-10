import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import OfficeSearchPage from './pages/citizen/OfficeSearchPage';
import OfficeDetailPage from './pages/citizen/OfficeDetailPage';
import BookTokenPage from './pages/citizen/BookTokenPage';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLiveQueue from './pages/admin/AdminLiveQueue';
import AdminOffices from './pages/admin/AdminOffices';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminServices from './pages/admin/AdminServices';
import AdminCounters from './pages/admin/AdminCounters';
import AdminStaff from './pages/admin/AdminStaff';
import AdminCitizens from './pages/admin/AdminCitizens';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Routes>
      {/* Redirect /display to home */}
      <Route path="/display" element={<Navigate to="/" replace />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/offices" element={<OfficeSearchPage />} />
        <Route path="/offices/:id" element={<OfficeDetailPage />} />

        {/* Citizen Protected Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={['citizen', 'admin']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/book"
          element={
            <ProtectedRoute allowedRoles={['citizen', 'admin']}>
              <BookTokenPage />
            </ProtectedRoute>
          }
        />

        {/* Staff Protected Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Panel Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="live-queue" element={<AdminLiveQueue />} />
        <Route path="offices" element={<AdminOffices />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="counters" element={<AdminCounters />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="citizens" element={<AdminCitizens />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
