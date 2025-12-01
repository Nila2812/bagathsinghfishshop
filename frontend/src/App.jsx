// src/App.jsx - COMPLETE WITH ALL ROUTES

import React from "react";
import { Routes, Route } from "react-router-dom";
import useSessionChecker from "./hooks/useSessionChecker";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CategoryProducts from "./pages/CategoryProducts";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import ProtectedRoute from "./admin/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProductDescription from "./pages/ProductDescription";
import ProtectedCheckoutRoute from "./components/ProtectedCheckoutRoute";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";


const App = () => {
  useSessionChecker(); // Session validation for all pages
  
  const AddressPageWrapper = () => {
    const navigate = useNavigate();
    // Using your existing modal logic but forcing it open
    return (
       <AddressListModal 
         open={true} 
         onClose={() => navigate('/profile')} // Go back to profile on close
         isLoggedIn={true}
         userId={localStorage.getItem("userId")} 
         // ... pass other handlers if needed or keep it simple
       />
    );
  };

  return (
    <CartProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/addresses" element={<AddressPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/products" element={<CategoryProducts />} />
        <Route path="/search" element={<CategoryProducts />} />
        <Route path="/product/:productId" element={<ProductDescription />} />

        {/* Protected User Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedCheckoutRoute>
              <CheckoutPage />
            </ProtectedCheckoutRoute>
          }
        />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
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