// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";

import AdminPanel from "./admin/AdminPanel";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminLogin from "./admin/AdminLogin";


// Import more pages here as you add them
// import ContactPage from "./pages/ContactPage";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin section */}
      <Route path="/admin/*" element={<AdminPanel />} />
    </Routes>
  );
};

export default App;
