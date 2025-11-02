import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RoomIcon from "@mui/icons-material/Room";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom"; // ✅ import navigation hook

const MainNavbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount] = useState(2);
  const [deliveryMessage, setDeliveryMessage] = useState("Deliverable");

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const navigate = useNavigate(); // ✅ initialize

  const mainTextColor = "#000000";
  const secondaryText = "#7d221d";

  return (
    <>
      {/* ======= DESKTOP NAVBAR ======= */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 40,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #E0E0E0",
          borderTop: "1px solid #E0E0E0",
          px: { xs: 1, sm: 1 },
          py: 0.5,
          display: { xs: "none", md: "flex" },
          boxShadow: "none",
          fontFamily: `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-evenly",
            flexWrap: "nowrap",
            width: "100%",
          }}
        >
          {/* --- Logo --- */}
          <Box
            component="img"
            src="src/img/logocon.jpg"
            alt="Logo"
            sx={{
              width: 65,
              height: 65,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")} // ✅ click logo → home
          />

          {/* --- Address --- */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ color: mainTextColor }} />
              <Typography sx={{ fontWeight: 600, color: mainTextColor }}>
                Select your address
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: deliveryMessage === "Deliverable" ? "#2e7d32" : "red",
                ml: 3.5,
              }}
            >
              {deliveryMessage}
            </Typography>
          </Box>

          {/* --- Search Bar --- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f8f8f8",
              borderRadius: 2,
              border: `1px solid ${mainTextColor}`,
              px: 1.5,
              py: 0.6,
              width: "35%",
            }}
          >
            <SearchIcon sx={{ mr: 1, color: mainTextColor }} />
            <InputBase
              placeholder="Search products..."
              sx={{
                width: "100%",
                color: secondaryText,
                fontFamily: `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
              }}
            />
          </Box>

          {/* --- Login --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <AccountCircleIcon sx={{ color: mainTextColor }} />
            <Typography sx={{ color: mainTextColor }}>
              Login / Register
            </Typography>
          </Box>

          {/* --- Cart --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{ color: mainTextColor }} />
            </Badge>
            <Typography sx={{ color: mainTextColor }}>Cart</Typography>
          </Box>

          {/* --- More --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Typography
              sx={{ cursor: "pointer", color: mainTextColor }}
              onClick={handleMenuOpen}
            >
              More
            </Typography>
            <ExpandMoreIcon sx={{ color: mainTextColor, cursor: "pointer" }} />
          </Box>

          {/* --- Dropdown Menu --- */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: `1px solid ${mainTextColor}`,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/about"); // ✅ Navigate to About Us
              }}
            >
              About Us
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/contact"); // ✅ Navigate to Contact Us
              }}
            >
              Contact Us
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ======= MOBILE NAVBAR ======= */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 40,
          backgroundColor: "#ffffff",
          color: mainTextColor,
          px: 2,
          py: 1,
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          boxShadow: "none",
        }}
      >
        {/* --- First Row: Menu + Logo + Address + Cart --- */}
        <Toolbar
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
            gap: 1,
          }}
        >
          <IconButton onClick={toggleDrawer(true)} sx={{ color: mainTextColor }}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component="img"
            src="src/img/logocon.jpg"
            alt="Logo"
            sx={{
              width: 45,
              height: 45,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")} // ✅ logo click → home
          />

          {/* Address */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ fontSize: 20, color: mainTextColor }} />
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: mainTextColor,
                }}
              >
                Select address
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: deliveryMessage === "Deliverable" ? "#2e7d32" : "red",
                ml: 3.2,
                mt: 0.1,
              }}
            >
              {deliveryMessage}
            </Typography>
          </Box>

          <IconButton sx={{ color: mainTextColor }}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>

        {/* --- Search Bar --- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f8f8f8",
            borderRadius: 0,
            border: `1px solid ${mainTextColor}`,
            px: 1.5,
            py: 0.6,
            width: "100%",
            mt: 0.8,
            mx: 1.2,
            boxSizing: "border-box",
          }}
        >
          <SearchIcon sx={{ color: mainTextColor, fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search products..."
            sx={{
              width: "100%",
              fontSize: "1rem",
              color: secondaryText,
            }}
          />
        </Box>
      </AppBar>

      {/* --- Drawer --- */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#ffffff",
            height: "100%",
            color: mainTextColor,
          }}
          role="presentation"
        >
         <List>
  <ListItemButton onClick={() => navigate("/about")}>
    <ListItemText primary="About Us" />
  </ListItemButton>
  <Divider />
  <ListItemButton onClick={() => navigate("/contact")}>
    <ListItemText primary="Contact Us" />
  </ListItemButton>
  <Divider />
  <ListItemButton onClick={() => navigate("/login")}>
    <ListItemText primary="Login / Register" />
  </ListItemButton>
</List>

        </Box>
      </Drawer>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');
        `}
      </style>
    </>
  );
};

export default MainNavbar;
