import React from "react";
import {
  BrowserRouter, // ✅ Swapped from HashRouter to remove the '#' symbol
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import { Toaster } from "react-hot-toast";
import ProjectDetailPage from "./pages/ProjectDetailPage";

// Admin Imports
import { AuthProvider } from "./src/contexts/AuthContext";
import AdminLoginPage from "./src/admin/pages/AdminLoginPage";
import PrivateRoute from "./src/admin/components/PrivateRoute";
import UsageDashboard from "./src/admin/pages/UsageDashboard";
import AdminLayout from "./src/admin/components/AdminLayout";
import AdminDashboardPage from "./src/admin/pages/AdminDashboardPage";
import AdminProjectsListPage from "./src/admin/pages/AdminProjectsListPage";
import AdminProjectFormPage from "./src/admin/pages/AdminProjectFormPage";
import AdminManagementPage from "./src/admin/pages/AdminManagementPage";
import AdminProfilePage from "./src/admin/pages/AdminProfilePage";
import TeamManager from "./src/admin/TeamManager";
import AdminCarouselManager from "./components/AdminCarouselManagement";
import ForgotPassword from './src/admin/pages/ForgetPassword';

const App: React.FC = () => {
  return (
    <BrowserRouter> {/* ✅ Updated master wrapper */}
      <AuthProvider>
        <Main />
      </AuthProvider>
    </BrowserRouter>
  );
};

const AdminRoutesLayout = () => (
  <PrivateRoute>
    <AdminLayout />
  </PrivateRoute>
);

const Main: React.FC = () => {
  const location = useLocation();

  // ✅ CLEAN ROUTE CHECK: Since the hash is gone, we can safely and cleanly check 
  // the standard URL pathname directly to hide the Navbar and Footer on Admin & Recovery layouts.
  const isAdminRoute = 
    location.pathname.startsWith("/admin") || 
    location.pathname === "/forgot-password";

  return (
    <div className="bg-brand-white text-brand-black font-sans">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "font-sans",
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      
      {/* Conditionally Render Navigation Headers */}
      {!isAdminRoute && <Navbar />}
      
      <main>
        <Routes>
          {/* 🏡 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* 🔒 Open Admin & Recovery Gates */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🛡️ Protected Shared Admin Dashboard Layout Group */}
          <Route element={<AdminRoutesLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/projects" element={<AdminProjectsListPage />} />
            <Route
              path="/admin/projects/new"
              element={<AdminProjectFormPage />}
            />
            <Route
              path="/admin/projects/:id/edit"
              element={<AdminProjectFormPage />}
            />
            <Route path="/admin/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/admin/admins" element={<AdminManagementPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/team" element={<TeamManager />} />
            <Route path="/admin/usage" element={<UsageDashboard />} />
            <Route path="/admin/carousel" element={<AdminCarouselManager />} />
          </Route>
        </Routes>
      </main>
      
      {/* Conditionally Render Structural Footers */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;