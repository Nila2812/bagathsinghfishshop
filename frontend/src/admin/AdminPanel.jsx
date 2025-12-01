import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  AppBar,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Import the full Dashboard component
import Dashboard from "./components/DashboardStats";

import AddProduct from "./pages/AddProduct";
import AddCategory from "./pages/AddCategory";
import AddOffer from "./pages/AddOffer";
import ViewProducts from "./pages/ViewProducts";
import ViewCategories from "./pages/ViewCategories";
import ViewOffers from "./pages/ViewOffers";
import ViewCustomers from "./pages/ViewCustomers";
import ViewOrders from "./pages/ViewOrders";
import ViewAdmins from "./pages/ViewAdmins";
import AddAdmin from "./pages/AddAdmin";
import EditAdmin from "./components/EditAdmin";
const drawerWidth = 240;

const AdminPanel = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminLoggedIn");
    sessionStorage.removeItem("adminRefreshInProgress");
    navigate("/admin", { replace: true });
    window.location.reload();
  };

  // 🔥 MODIFIED: Handle refresh flag and normal logout
  useEffect(() => {
    // Check if this is a manual refresh (from refresh button)
    const refreshInProgress = sessionStorage.getItem("adminRefreshInProgress");
    
    if (refreshInProgress) {
      // It's a manual refresh, restore session and clear flag
      sessionStorage.setItem("isAdminLoggedIn", "true");
      sessionStorage.removeItem("adminRefreshInProgress");
    }

    // Handle tab/browser close and route changes
    const handleUnload = () => {
      // Only clear session if NOT a manual refresh
      const isRefreshing = sessionStorage.getItem("adminRefreshInProgress");
      if (!isRefreshing) {
        sessionStorage.removeItem("isAdminLoggedIn");
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);

      // Logout when navigating away from admin routes
      if (!location.pathname.startsWith("/admin/dashboard")) {
        sessionStorage.removeItem("isAdminLoggedIn");
        sessionStorage.removeItem("adminRefreshInProgress");
      }
    };
  }, [location]);

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
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
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
        ModalProps={{ keepMounted: true }}
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
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-offer" element={<AddOffer />} />
          <Route path="add-admin" element={<AddAdmin />} />
          <Route path="view-products" element={<ViewProducts />} />
          <Route path="view-categories" element={<ViewCategories />} />
          <Route path="view-offers" element={<ViewOffers />} />
          <Route path="view-customers" element={<ViewCustomers />} />
          <Route path="view-orders" element={<ViewOrders />} />
          <Route path="view-admins" element={<ViewAdmins />} />
           <Route path="edit-admin/:id" element={<EditAdmin />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminPanel;