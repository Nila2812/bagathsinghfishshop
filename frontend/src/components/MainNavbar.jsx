import React, { useEffect, useState } from "react";
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

const MainNavbar = ({ fixed = true }) => {
  const [editingAddress, setEditingAddress] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState(null);
  const [deliverable, setDeliverable] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const SHOP = { lat: 9.919470515872366, lon: 78.15947123056876 };

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

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

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

  const handleAddressClick = () => {
    setListOpen(true);
  };

  const mainTextColor = "#000000";
  const secondaryText = "#7d221d";

  return (
    <>
      {/* Desktop */}
      <AppBar position={fixed ? "fixed" : "relative"} elevation={0}
        sx={{
          top: fixed ? 40 : "auto", backgroundColor: "#ffffff",
          borderBottom: "1px solid #E0E0E0", borderTop: fixed ? "1px solid #E0E0E0" : "none",
          px: { xs: 1, sm: 1 }, py: 0.5, display: { xs: "none", md: "flex" },
          boxShadow: fixed ? "none" : "0px 2px 4px rgba(0,0,0,0.05)",
          fontFamily: `'Montserrat', sans-serif`
        }}
      >
        <Toolbar sx={{ justifyContent: "space-evenly", width: "100%" }}>
          <Box component="img" src={logo} alt="Logo" 
            sx={{ width: 65, height: 65, cursor: "pointer" }} 
            onClick={() => navigate("/")} />

          <Box sx={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
            onClick={handleAddressClick}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ color: mainTextColor }} />
              <Tooltip title={address ? `${address.doorNo || ""} ${address.street || ""}`.trim() : "Select address"}>
                <Typography sx={{
                  fontWeight: 600, color: mainTextColor,
                  maxWidth: 160, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {address 
                    ? `${address.doorNo || ""} ${address.street || ""}`.trim() || "Your address"
                    : "Select your address"}
                </Typography>
              </Tooltip>
            </Box>
            {address && (
              <Typography variant="subtitle2"
                sx={{ color: deliverable ? "#2e7d32" : "red", ml: 3.5 }}>
                {deliverable ? "Deliverable" : "Not Deliverable"}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", backgroundColor: "#f8f8f8",
            borderRadius: 2, border: `1px solid ${mainTextColor}`, px: 1.5, py: 0.6, width: "35%" }}>
            <SearchIcon sx={{ mr: 1, color: mainTextColor }} />
            <InputBase placeholder="Search products..." 
              sx={{ width: "100%", color: secondaryText, fontFamily: `'Montserrat', sans-serif` }} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <AccountCircleIcon sx={{ color: mainTextColor }} />
            <Typography sx={{ color: mainTextColor }}>Login / Register</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, cursor: "pointer" }}
            onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{ color: mainTextColor }} />
            </Badge>
            <Typography sx={{ color: mainTextColor }}>Cart</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Typography sx={{ cursor: "pointer", color: mainTextColor }}
              onClick={(e) => setAnchorEl(e.currentTarget)}>More</Typography>
            <ExpandMoreIcon sx={{ color: mainTextColor, cursor: "pointer" }} />
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            sx={{ "& .MuiPaper-root": { backgroundColor: "#ffffff", borderRadius: "8px", border: `1px solid ${mainTextColor}` } }}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/about"); }}>About Us</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/contact"); }}>Contact Us</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile */}
      <AppBar position={fixed ? "fixed" : "relative"} elevation={0}
        sx={{
          top: fixed ? 36 : "auto", backgroundColor: "#ffffff", color: mainTextColor,
          px: 2, py: 1, display: { xs: "flex", md: "none" }, flexDirection: "column",
          boxShadow: fixed ? "none" : "0px 2px 4px rgba(0,0,0,0.05)"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", alignItems: "center", px: 0, gap: 1 }}>
          <IconButton sx={{ color: mainTextColor }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box component="img" src={logo} alt="Logo"
            sx={{ width: 45, height: 45, cursor: "pointer" }}
            onClick={() => navigate("/")} />
          
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer" }}
            onClick={handleAddressClick}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ fontSize: 20, color: mainTextColor }} />
              <Typography sx={{
                fontWeight: 600, fontSize: "0.9rem", color: mainTextColor,
                maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>
                {address 
                  ? `${address.doorNo || ""} ${address.street || ""}`.trim() || "Address"
                  : "Select address"}
              </Typography>
            </Box>
            {address && (
              <Typography variant="caption"
                sx={{ color: deliverable ? "#2e7d32" : "red", ml: 3.2, mt: 0.1 }}>
                {deliverable ? "Deliverable" : "Not Deliverable"}
              </Typography>
            )}
          </Box>

          <IconButton sx={{ color: mainTextColor }} onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>

        <Box sx={{
          display: "flex", alignItems: "center", backgroundColor: "#f8f8f8",
          borderRadius: 0, border: `1px solid ${mainTextColor}`, px: 1.5, py: 0.6,
          width: "100%", mt: 0.8, mx: 1.2, boxSizing: "border-box"
        }}>
          <SearchIcon sx={{ color: mainTextColor, fontSize: 20, mr: 1 }} />
          <InputBase placeholder="Search products..." 
            sx={{ width: "100%", fontSize: "1rem", color: secondaryText }} />
        </Box>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, backgroundColor: "#ffffff", height: "100%", color: mainTextColor }}>
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
    </>
  );
};

export default MainNavbar;