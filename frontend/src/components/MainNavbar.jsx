/* ---------- FINAL CLEAN & FIXED MAIN NAVBAR ---------- */

import React, { useEffect, useState } from "react";
import SearchDrawer from "./SearchDrawer";
import {
  AppBar, Toolbar, Typography, Box, IconButton, InputBase, Badge,
  Menu, MenuItem, Drawer, List, ListItemButton, ListItemText, Divider, Tooltip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RoomIcon from "@mui/icons-material/Room";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import logo from "../img/logocon.jpg";
import { getClientId } from "../utils/clientId";
import { checkDeliveryDistance } from "../utils/distance";
import AddressFormModal from "./AddressFormModal";
import AddressListModal from "./AddressListModal";
import LoginDrawer from "./LoginDrawer";

const MainNavbar = ({ fixed = true }) => {

  /* ----------------------------- STATE ----------------------------- */

  const [editingAddress, setEditingAddress] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const [address, setAddress] = useState(null);
  const [deliverable, setDeliverable] = useState(null);

  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const SHOP = { lat: 9.919470515872366, lon: 78.15947123056876 };

  /* ----------------------------- LOAD ADDRESS ----------------------------- */

  useEffect(() => {
    const clientId = getClientId();

    fetch(`/api/address/${clientId}`)
      .then(r => r.json())
      .then(items => {
        const def = items.find(i => i.isDefault) || items[0];
        if (def) {
          setAddress(def);
          // Since address is already saved, it's already validated - no need to check again
          setDeliverable(true);
        } else {
          setAddress(null);
          setDeliverable(null);
        }
      })
      .catch(() => {});
  }, []);

  const deliveryMessage =
    deliverable === null ? "" :
    deliverable ? "Deliverable" : "Not Deliverable";

  /* ----------------------------- CART EVENT ----------------------------- */

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("openCart", handleOpenCart);
    return () => window.removeEventListener("openCart", handleOpenCart);
  }, []);

  /* ----------------------------- FUNCTIONS ----------------------------- */

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const toggleMenuDrawer = (open) => () => setMenuDrawerOpen(open);

  const handleSavedAddress = (saved) => {
    // Address was just saved/edited, so it's already validated during save
    setAddress(saved);
    setDeliverable(true);
  };

  const handleSelectAddress = (addr) => {
    // Selecting existing saved address - already validated when it was saved
    setAddress(addr);
    setDeliverable(true);
    setListOpen(false);
  };

  const mainTextColor = "#282828ff";
  const secondaryText = "#7d221d";

  /* ----------------------------- RETURN UI ----------------------------- */

  return (
    <>
      {/* ============================================================= */}
      {/* ====================== DESKTOP NAVBAR ======================== */}
      {/* ============================================================= */}

      <AppBar
        position={fixed ? "fixed" : "relative"}
        elevation={0}
        sx={{
          top: fixed ? 40 : "auto",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #E0E0E0",
          px: 1,
          py: 0.5,
          display: "none",
          "@media (min-width:1024px)": { display: "flex" },
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-evenly", width: "100%" }}>
          
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            sx={{ width: 80, height: 65, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* Address */}
          <Box onClick={() => setListOpen(true)} sx={{ cursor: "pointer" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ color: mainTextColor }} />
              <Tooltip title={address ? `${address.doorNo} ${address.street}` : "Select address"}>
                <Typography sx={{
                  fontWeight: 600,
                  maxWidth: 160,
                   color: mainTextColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {address ? `${address.doorNo || ""} ${address.street || ""}` : "Select address"}
                </Typography>
              </Tooltip>
            </Box>

            {address && (
              <Typography variant="subtitle2" sx={{ color: deliverable ? "green" : "red", ml: 3.5 }}>
                {deliveryMessage}
              </Typography>
            )}
          </Box>

          {/* Search */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: "#f8f8f8",
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ width: "100%", color: secondaryText }}
            />
          </Box>

          {/* Login */}
          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setLoginDrawerOpen(true)}>
            <AccountCircleIcon sx={{ color: mainTextColor}} />
            <Typography sx={{ ml: 0.6 , color: mainTextColor}}>Login / Sign Up</Typography>
          </Box>

          {/* Cart */}
          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{ color: mainTextColor}} />
            </Badge>
            <Typography sx={{ ml: 0.6, color: mainTextColor }}>Cart</Typography>
          </Box>

          {/* More */}
          <IconButton onClick={handleMenuOpen}>
            <Typography sx={{ color: mainTextColor}}>More</Typography>
            <ExpandMoreIcon sx={{color: mainTextColor,}} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ============================================================= */}
      {/* ======================= TABLET NAVBAR ======================== */}
      {/* ============================================================= */}

      <AppBar
          position={fixed ? "fixed" : "relative"}
          elevation={0}
          sx={{
            top: fixed ? 36 : "auto",
            background: "#ffffff",
            color: mainTextColor,
            width: "100% !important",  // ⭐ FIX: prevent overflow
            overflow: "hidden",        // ⭐ FIX
            display: "none",
            "@media (min-width:600px) and (max-width:1023px)": {
              display: "flex",
            },
            boxShadow: "none",
          }}
        >
       <Toolbar
        sx={{
          justifyContent: "space-between",
          width: "100%",
          px: 2,             // ⭐ increases left-right padding
          pr: 3,             // ⭐ pushes More button slightly left
          color: mainTextColor,
        }}
      >
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            sx={{ width: 60, height: 55, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* Address */}
<Box onClick={() => setListOpen(true)} sx={{ cursor: "pointer" }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
    <RoomIcon sx={{ fontSize: 22, color: mainTextColor }} />

    <Typography
      sx={{
        fontWeight: 600,
        maxWidth: 140,
        fontSize: "0.9rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: mainTextColor,
      }}
    >
      {address ? `${address.doorNo || ""} ${address.street || ""}` : "Select address"}
    </Typography>
  </Box>

  {address && (
    <Typography
      variant="subtitle2"
      sx={{
        color: deliverable ? "green" : "red",
        ml: 3.5,
        mt: "-2px",
        fontSize: "0.75rem",
      }}
    >
      {deliveryMessage}
    </Typography>
  )}
</Box>

          {/* Search */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: `1px solid ${mainTextColor}`,
              borderRadius: 2,
              px: 1.5,
              py: 0.6,
              width: "30%",  // ❗ fixed shrinking issue
              background: "#f8f8f8",
            }}
          >
            <SearchIcon sx={{ mr: 1 }} />
            <InputBase
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ width: "100%" }}
            />
          </Box>

          {/* Login */}
          <IconButton onClick={() => setLoginDrawerOpen(true)}>
            <AccountCircleIcon sx={{color: mainTextColor, }}/>
          </IconButton>

          {/* Cart */}
          <IconButton onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{color: mainTextColor, }} />
            </Badge>
          </IconButton>

          {/* More */}
          <IconButton onClick={handleMenuOpen} sx={{ mr: 3}}>
            <Typography sx={{ color: mainTextColor }}>More</Typography>
            <ExpandMoreIcon sx={{ color: mainTextColor }} />
          </IconButton>

        </Toolbar>
      </AppBar>

      {/* ============================================================= */}
      {/* ======================= MOBILE NAVBAR ======================== */}
      {/* ============================================================= */}

      <AppBar
  elevation={0}
  sx={{
    display: { xs: "flex", sm: "none" },
    background: "#ffffff",
    color: mainTextColor,
    top: fixed ? 36 : "auto",
    width: "100% !important",   // ⭐ FIX tablet/mobile overflow
    overflow: "hidden",         // ⭐ Prevent horizontal scroll
    boxShadow: "none",
  }}
>

        <Toolbar sx={{ justifyContent: "space-between", px: 1 }}>

          {/* Drawer button */}
          <IconButton onClick={toggleMenuDrawer(true)}>
            <MenuIcon sx={{color: mainTextColor,}} />
          </IconButton>

         {/* Address */}
<Box sx={{ cursor: "pointer" }} onClick={() => setListOpen(true)}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
    <RoomIcon sx={{ fontSize: 20, color: mainTextColor }} />

    <Typography
      sx={{
        fontWeight: 600,
        maxWidth: 110,
        fontSize: "0.8rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: mainTextColor,
      }}
    >
      {address ? `${address.doorNo || ""} ${address.street || ""}` : "Select address"}
    </Typography>
  </Box>

  {address && (
    <Typography
      sx={{
        color: deliverable ? "green" : "red",
        ml: 3.2,
        mt: "-2px",
        fontSize: "0.7rem",
      }}
    >
      {deliveryMessage}
    </Typography>
  )}
</Box>


          {/* Logo */}
          <Box
            component="img"
            src={logo}
            sx={{ width: 49, height: 45, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setSearchDrawerOpen(true)}>
              <SearchIcon sx={{color: mainTextColor,}}/>
            </IconButton>

            <IconButton onClick={() => setCartOpen(true)}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon sx={{color: mainTextColor,}} />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ============================================================= */}
      {/* =========================== DRAWERS ========================== */}
      {/* ============================================================= */}

      <Drawer anchor="left" open={menuDrawerOpen} onClose={toggleMenuDrawer(false)}>
        <Box sx={{ width: 200 }}>
          <List>
            <ListItemButton onClick={() => navigate("/about")}>
              <ListItemText primary="About Us" />
            </ListItemButton>
            <Divider />
            <ListItemButton onClick={() => navigate("/contact")}>
              <ListItemText primary="Contact Us" />
            </ListItemButton>
            <Divider />
            <ListItemButton
              onClick={() => {
                setLoginDrawerOpen(true);
                setMenuDrawerOpen(false);
              }}
            >
              <ListItemText primary="Login / Register" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AddressFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingAddress(null); }}
        onSaved={(saved) => {
          handleSavedAddress(saved);
          setFormOpen(false);
          setEditingAddress(null);
        }}
        defaultValues={editingAddress}
      />

      <AddressListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={handleSelectAddress}
        selectedAddressId={address?._id}
        onAddNew={() => {
          setListOpen(false);
          setEditingAddress(null);
          setFormOpen(true);
        }}
        onEdit={(addr) => {
          setListOpen(false);
          setEditingAddress(addr);
          setFormOpen(true);
        }}
      />

      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); navigate("/about"); }}>About Us</MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate("/contact"); }}>Contact Us</MenuItem>
      </Menu>

      <SearchDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        onSearch={(term) =>
          navigate(`/search?query=${encodeURIComponent(term)}`)
        }
      />
    </>
  );
};

export default MainNavbar;
