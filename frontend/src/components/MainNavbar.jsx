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
import AddressFormModal from "./AddressFormModal";
import AddressListModal from "./AddressListModal";
import LoginDrawer from "./LoginDrawer";

const MainNavbar = ({ fixed = true }) => {

  /* ----------------------------- STATE ----------------------------- */

  const [editingAddress, setEditingAddress] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const [address, setAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  /* ----------------------------- CHECK LOGIN STATUS ----------------------------- */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(userData.name || "User");
    }

    // Listen for login events
    const handleLoginSuccess = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(userData.name || "User");
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, []);

  const SHOP = { lat: 9.919470515872366, lon: 78.15947123056876 };

  /* ----------------------------- LOAD ADDRESS ----------------------------- */

  useEffect(() => {
    const clientId = getClientId();

    // Check if there's a selected address in localStorage
    const savedAddressId = localStorage.getItem('selectedAddressId');

    fetch(`/api/address/${clientId}`)
      .then(r => r.json())
      .then(items => {
        if (items.length === 0) {
          setAddress(null);
          return;
        }

        let selectedAddress = null;

        // First, try to find the address saved in localStorage
        if (savedAddressId) {
          selectedAddress = items.find(i => i._id === savedAddressId);
        }

        // If not found, fall back to default address
        if (!selectedAddress) {
          selectedAddress = items.find(i => i.isDefault) || items[0];
        }

        setAddress(selectedAddress);
      })
      .catch(() => {});
  }, []);

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

  const handleAccountMenuOpen = (event) => setAccountAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAccountAnchorEl(null);

  const toggleMenuDrawer = (open) => () => setMenuDrawerOpen(open);

  const handleSavedAddress = (saved) => {
    // Address was just saved/edited
    setAddress(saved);
    // Save to localStorage
    localStorage.setItem('selectedAddressId', saved._id);
  };

  const handleSelectAddress = (addr) => {
    // Selecting existing saved address
    setAddress(addr);
    // Save to localStorage
    localStorage.setItem('selectedAddressId', addr._id);
    setListOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserName("");
    handleAccountMenuClose();
    navigate("/");
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
              <RoomIcon sx={{ color: mainTextColor, fontSize: 20 }} />
              <Box>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: mainTextColor,
                }}>
                  {address ? `Hey, ${address.name}` : "Select address"}
                </Typography>
                
                {address && (
                  <Tooltip title={`${address.doorNo} ${address.street}, ${address.locality}`}>
                    <Typography sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      maxWidth: 160,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {`${address.doorNo || ""} ${address.street || ""}`.trim()}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            </Box>
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

          {/* Account / Login */}
          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <IconButton onClick={handleAccountMenuOpen}>
                <AccountCircleIcon sx={{ color: mainTextColor}} />
                <Typography sx={{ ml: 0.6, color: mainTextColor }}>Account</Typography>
                <ExpandMoreIcon sx={{ color: mainTextColor, fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => setLoginDrawerOpen(true)}>
              <AccountCircleIcon sx={{ color: mainTextColor}} />
              <Typography sx={{ ml: 0.6 , color: mainTextColor}}>Login / Sign Up</Typography>
            </Box>
          )}

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
            width: "100% !important",
            overflow: "hidden",
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
          px: 2,
          pr: 3,
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
              <RoomIcon sx={{ fontSize: 20, color: mainTextColor }} />
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: mainTextColor,
                  }}
                >
                  {address ? `Hey, ${address.name}` : "Select address"}
                </Typography>

                {address && (
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "text.secondary",
                      maxWidth: 140,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {`${address.doorNo || ""} ${address.street || ""}`.trim()}
                  </Typography>
                )}
              </Box>
            </Box>
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
              width: "30%",
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

          {/* Account / Login */}
          {isLoggedIn ? (
            <IconButton onClick={handleAccountMenuOpen}>
              <AccountCircleIcon sx={{color: mainTextColor, }}/>
              <ExpandMoreIcon sx={{ color: mainTextColor, fontSize: 16, ml: 0.5 }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setLoginDrawerOpen(true)}>
              <AccountCircleIcon sx={{color: mainTextColor, }}/>
            </IconButton>
          )}

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
          width: "100% !important",
          overflow: "hidden",
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
              <RoomIcon sx={{ fontSize: 18, color: mainTextColor }} />
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: mainTextColor,
                  }}
                >
                  {address ? `Hey, ${address.name}` : "Select address"}
                </Typography>

                {address && (
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "text.secondary",
                      maxWidth: 110,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {`${address.doorNo || ""} ${address.street || ""}`.trim()}
                  </Typography>
                )}
              </Box>
            </Box>
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
            {isLoggedIn ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            ) : (
              <ListItemButton
                onClick={() => {
                  setLoginDrawerOpen(true);
                  setMenuDrawerOpen(false);
                }}
              >
                <ListItemText primary="Login / Register" />
              </ListItemButton>
            )}
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

      {/* Account Dropdown Menu */}
      <Menu 
        anchorEl={accountAnchorEl} 
        open={Boolean(accountAnchorEl)} 
        onClose={handleAccountMenuClose}
      >
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/profile"); }}>
          {userName}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/orders"); }}>
          My Orders
        </MenuItem>
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/addresses"); }}>
          Saved Addresses
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "#D32F2F" }}>
          Logout
        </MenuItem>
      </Menu>

      {/* More Menu */}
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