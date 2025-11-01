import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Typography,
  Drawer,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

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

import LowStockTable from "./components/LowStockTable";
import OrderStatusSummary from "./components/OrderStatusSummary";
import SystemHealthCard from "./components/SystemHealthCard";

const drawerWidth = 240;

// ✅ Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
        }}
      >
        Welcome to Admin Panel
      </Typography>

      {!stats ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {[
            { key: "products", label: "Total Products", icon: "🐟" },
            { key: "offers", label: "Total Offers", icon: "🎁" },
            { key: "categories", label: "Total Categories", icon: "📂" },
            { key: "customers", label: "Total Customers", icon: "👥" },
            { key: "orders", label: "Total Orders", icon: "📦" },
          ].map(({ key, label, icon }) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Card sx={{ bgcolor: "#fff", boxShadow: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {icon} {label}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {stats[key]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Optional Sections */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <LowStockTable />
        </Grid>

        <Grid item xs={12}>
          <OrderStatusSummary />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <SystemHealthCard />
        </Grid>
      </Grid>
    </>
  );
};

// ✅ Main AdminPanel Component
const AdminPanel = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log("Admin logged out");
    // window.location.href = "/admin/login";
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Sidebar />
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#1e1e1e",
        }}
      >
        <Toolbar>
          {/* Hamburger menu (visible only on mobile) */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

         <Navbar onLogout={handleLogout} onMenuClick={handleDrawerToggle} />

        </Toolbar>
      </AppBar>

      {/* Drawer for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#000",
            color: "#fff",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Drawer for Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#000",
            color: "#fff",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
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
