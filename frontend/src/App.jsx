import React from "react";
import { Routes, Route } from "react-router-dom";
import useSessionChecker from "./hooks/useSessionChecker";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CategoryProducts from "./pages/CategoryProducts";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import ProtectedRoute from "./admin/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProductDescription from "./pages/ProductDescription";
const App = () => {
  useSessionChecker();
  return (
    <CartProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/products" element={<CategoryProducts />} />
        <Route path="/search" element={<CategoryProducts />} />
        <Route path="/product/:productId" element={<ProductDescription />} />

        <Route path = "/checkout" element={<CheckoutPage/>} />
        {/* Admin Login Page */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Protected Admin Panel */}
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
              </Routes>
            </CartProvider>
  );
};

export default App;