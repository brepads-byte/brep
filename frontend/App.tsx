

import React from 'react';
import { HashRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { Toaster } from 'react-hot-toast';
import ProjectDetailPage from './pages/ProjectDetailPage';
// Admin Imports
import { AuthProvider } from './src/contexts/AuthContext';
import AdminLoginPage from './src/admin/pages/AdminLoginPage';
import PrivateRoute from './src/admin/components/PrivateRoute';
import AdminLayout from './src/admin/components/AdminLayout';
import AdminDashboardPage from './src/admin/pages/AdminDashboardPage';
import AdminProjectsListPage from './src/admin/pages/AdminProjectsListPage';
import AdminProjectFormPage from './src/admin/pages/AdminProjectFormPage';
import AdminManagementPage from './src/admin/pages/AdminManagementPage';
import AdminProfilePage from './src/admin/pages/AdminProfilePage';
import TeamManager from './src/admin/TeamManager';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </HashRouter>
  );
};

const AdminRoutesLayout = () => (
  <PrivateRoute>
    <AdminLayout />
  </PrivateRoute>
);


const Main: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="bg-brand-white text-brand-black font-sans">
      <Toaster position="bottom-right" toastOptions={{
        className: 'font-sans',
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected Admin Layout Route */}
          <Route element={<AdminRoutesLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/projects" element={<AdminProjectsListPage />} />
            <Route path="/admin/projects/new" element={<AdminProjectFormPage />} />
            <Route path="/admin/projects/:id/edit" element={<AdminProjectFormPage />} />
            <Route path="/admin/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/admin/admins" element={<AdminManagementPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/team" element={<TeamManager />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
