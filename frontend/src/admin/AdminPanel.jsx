// src/admin/AdminPanel.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar"; // ✅ Import Navbar
import AddProduct from "./pages/AddProduct";
import AddCategory from "./pages/AddCategory";
import AddOffer from "./pages/AddOffer";
import ViewProducts from "./pages/ViewProducts";
import ViewCategories from "./pages/ViewCategories";
import ViewOffers from "./pages/ViewOffers";
import ViewCustomers from "./pages/ViewCustomers";
import ViewOrders from "./pages/ViewOrders";
import ViewAdmins from "./pages/ViewAdmins";

// Optional Dashboard page
const Dashboard = () => (
  <div className="text-center text-2xl font-semibold mt-10">
    Welcome to Admin Panel
  </div>
);

const AdminPanel = () => {
  // optional logout handler
  const handleLogout = () => {
    // Example action: clear token and redirect to login
    console.log("Admin logged out");
    // window.location.href = "/login"; // Uncomment when you have a login page
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/5 bg-black text-white">
        <Sidebar />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        {/* ✅ Navbar on top */}
        <Navbar onLogout={handleLogout} />

        {/* ✅ Scrollable content below navbar */}
        <div className="flex-1 overflow-auto p-4">
          <Routes>
            {/* Default route */}
            <Route index element={<Dashboard />} />

            {/* Other pages */}
            <Route path="add-product" element={<AddProduct />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="add-offer" element={<AddOffer />} />
            <Route path="view-products" element={<ViewProducts />} />
            <Route path="view-categories" element={<ViewCategories />} />
            <Route path="view-offers" element={<ViewOffers />} />
            <Route path="view-customers" element={<ViewCustomers />} />
            <Route path="view-orders" element={<ViewOrders />} />
            <Route path="view-admins" element={<ViewAdmins />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
