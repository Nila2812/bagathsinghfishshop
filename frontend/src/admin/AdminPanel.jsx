import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Typography,
  Drawer,
} from "@mui/material";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import AddProduct from "./pages/AddProduct";
import AddCategory from "./pages/AddCategory";
import AddOffer from "./pages/AddOffer";
import ViewProducts from "./pages/ViewProducts";
import ViewCategories from "./pages/ViewCategories";
import ViewOffers from "./pages/ViewOffers";
import ViewCustomers from "./pages/ViewCustomers";
import ViewOrders from "./pages/ViewOrders";
import ViewAdmins from "./pages/ViewAdmins";

const drawerWidth = 240;

const Dashboard = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      fontSize: "1.5rem",
      fontWeight: 600,
    }}
  >
    Welcome to Admin Panel
  </Box>
);

const AdminPanel = () => {
  const handleLogout = () => {
    console.log("Admin logged out");
    // window.location.href = "/admin/login";
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ✅ Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: "#1e1e1e",
        }}
      >
        <Toolbar>
          <Navbar onLogout={handleLogout} />
        </Toolbar>
      </AppBar>

      {/* ✅ Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#000",
            color: "#fff",
          },
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* ✅ Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#f4f5f7",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Routes>
          <Route index element={<Dashboard />} />
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
      </Box>
    </Box>
  );
};

export default AdminPanel;
