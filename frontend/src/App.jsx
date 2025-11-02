// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";

import AdminPanel from "./admin/AdminPanel";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminLogin from "./admin/AdminLogin";
import CategoriesPage from "./pages/CategoriesPage";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
  <Route path="/categories" element={<CategoriesPage />} />

      {/* ✅ Admin Login Page */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* ✅ Protected Admin Panel */}
      <Route
        path="/admin/dashboard/*"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
