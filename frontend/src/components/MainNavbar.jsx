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
import { getClientId, regenerateClientId } from "../utils/clientId";
import AddressFormModal from "./AddressFormModal";
import AddressListModal from "./AddressListModal";
import LoginDrawer from "./LoginDrawer";
import { useLanguage } from "./LanguageContext";

const MainNavbar = ({ fixed = true }) => {
  const [editingAddress, setEditingAddress] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const { language } = useLanguage();

  const [address, setAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Check login status
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(userData.name || "User");
      setUserId(userData.id);
    }

    const handleLoginSuccess = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(userData.name || "User");
        setUserId(userData.id);
        fetchAddresses(userData.id, "user");
      }
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      setUserName("");
      setUserId(null);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  // Load addresses on mount
  useEffect(() => {
    const clientId = getClientId();
    if (isLoggedIn && userId) {
      fetchAddresses(userId, "user");
    } else {
      fetchAddresses(clientId, "client");
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
  const handleOpenLogin = () => setLoginDrawerOpen(true);
  window.addEventListener("openLoginDrawer", handleOpenLogin);
  return () => window.removeEventListener("openLoginDrawer", handleOpenLogin);
}, []);

  const fetchAddresses = async (identifier, type) => {
    try {
      const response = await fetch(`/api/address/${identifier}?type=${type}`);
      const items = await response.json();

      if (items.length === 0) {
        setAddress(null);
        return;
      }

      const savedAddressId = localStorage.getItem('selectedAddressId');
      let selectedAddress = null;

      if (savedAddressId) {
        selectedAddress = items.find(i => i._id === savedAddressId);
      }

      if (!selectedAddress) {
        selectedAddress = items.find(i => i.isDefault) || items[0];
      }

      setAddress(selectedAddress);
      if (selectedAddress) {
        localStorage.setItem('selectedAddressId', selectedAddress._id);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  // Event listeners
  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("openCart", handleOpenCart);
    return () => window.removeEventListener("openCart", handleOpenCart);
  }, []);

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
    setAddress(saved);
    localStorage.setItem('selectedAddressId', saved._id);
  };

  const handleSelectAddress = (addr) => {
    setAddress(addr);
    localStorage.setItem('selectedAddressId', addr._id);
    setListOpen(false);
  };

  // 🔥 LOGOUT WITH API CALL
  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      // Call logout endpoint (optional, for logging purposes)
      if (userId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
      }
    } catch (err) {
      console.error("Logout API error:", err);
    }

    // Clear all data
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("selectedAddressId");
    
    setIsLoggedIn(false);
    setUserName("");
    setUserId(null);
    setAddress(null);
    handleAccountMenuClose();
    
    // Generate NEW clientId for fresh guest session
    regenerateClientId();
    
    // Trigger global logout event
    window.dispatchEvent(new Event("logout"));
    
    console.log(`🔓 User logged out`);
    navigate("/");
  };

  const mainTextColor = "#282828ff";
  const secondaryText = "#7d221d";

  return (
    <>
      {/* DESKTOP NAVBAR */}
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
          <Box
            component="img"
            src={logo}
            sx={{ width: 80, height: 65, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* 🔥 Address - Always clickable */}
          <Box 
            onClick={() => setListOpen(true)}
            sx={{ cursor: "pointer" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ color: mainTextColor, fontSize: 20 }} />
              <Box>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: mainTextColor,
                }}>
                  
            {address ? `${language === "EN" ? "Hey" : "வணக்கம்"}, ${address.name}` : (language === "EN" ? "Add address" : "முகவரியைச் சேர்க்க") }

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
              placeholder={language === "EN" ? "Search products..." : "பொருட்களைத் தேடவும்..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ width: "100%", color: secondaryText }}
            />
          </Box>

          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <IconButton onClick={handleAccountMenuOpen}>
                <AccountCircleIcon sx={{ color: mainTextColor}} />
                <Typography sx={{ ml: 0.6, color: mainTextColor }}>
                  {language === "EN" ? "Account" : "கணக்கு"}
                </Typography>
                <ExpandMoreIcon sx={{ color: mainTextColor, fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => setLoginDrawerOpen(true)}>
              <AccountCircleIcon sx={{ color: mainTextColor}} />
              <Typography sx={{ ml: 0.6 , color: mainTextColor}}>
                  {language === "EN" ? "Login / Sign Up" : "உள்நுழைவு / பதிவு"}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{ color: mainTextColor}} />
            </Badge>
            <Typography sx={{ ml: 0.6, color: mainTextColor }}>
               {language === "EN" ? "Cart" : "கார்ட்"}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen}>
            <Typography sx={{ color: mainTextColor}}>
                {language === "EN" ? "More" : "மேலும்"}
            </Typography>
            <ExpandMoreIcon sx={{color: mainTextColor,}} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* TABLET NAVBAR */}
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
        <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 2, pr: 3, color: mainTextColor }}>
          <Box
            component="img"
            src={logo}
            sx={{ width: 60, height: 55, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* 🔥 Address - Always clickable */}
          <Box 
            onClick={() => setListOpen(true)}
            sx={{ cursor: "pointer" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ fontSize: 20, color: mainTextColor }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: mainTextColor }}>
                
                  {address ? `${language === "EN" ? "Hey" : "வணக்கம்"}, ${address.name}` : (language === "EN" ? "Add address" : "முகவரியைச் சேர்க்க") }
               

                </Typography>

                {address && (
                  <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {`${address.doorNo || ""} ${address.street || ""}`.trim()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", border: `1px solid ${mainTextColor}`, borderRadius: 2, px: 1.5, py: 0.6, width: "30%", background: "#f8f8f8" }}>
            <SearchIcon sx={{ mr: 1 }} />
            <InputBase
              placeholder={language === "EN" ? "Search..." : "தேடவும்..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ width: "100%" }}
            />
          </Box>

          {isLoggedIn ? (
            <IconButton onClick={handleAccountMenuOpen}>
              <AccountCircleIcon sx={{color: mainTextColor}}/>
              <ExpandMoreIcon sx={{ color: mainTextColor, fontSize: 16, ml: 0.5 }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setLoginDrawerOpen(true)}>
              <AccountCircleIcon sx={{color: mainTextColor}}/>
            </IconButton>
          )}

          <IconButton onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon sx={{color: mainTextColor}} />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ mr: 3}}>
            <Typography sx={{ color: mainTextColor }}>
                {language === "EN" ? "More" : "மேலும்"}
            </Typography>
            <ExpandMoreIcon sx={{ color: mainTextColor }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MOBILE NAVBAR */}
      <AppBar elevation={0} sx={{ display: { xs: "flex", sm: "none" }, background: "#ffffff", color: mainTextColor, top: fixed ? 36 : "auto", width: "100% !important", overflow: "hidden", boxShadow: "none" }}>
        <Toolbar sx={{ justifyContent: "space-between", px: 1 }}>
          <IconButton onClick={toggleMenuDrawer(true)}>
            <MenuIcon sx={{color: mainTextColor}} />
          </IconButton>

          {/* 🔥 Address - Always clickable */}
          <Box sx={{ cursor: "pointer" }} onClick={() => setListOpen(true)}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <RoomIcon sx={{ fontSize: 18, color: mainTextColor }} />
              <Box>
                <Typography sx={{ fontWeight: 400, fontSize: "0.75rem", color: mainTextColor }}>
  {address ? `${language === "EN" ? "Hey" : "வணக்கம்"}, ${address.name}` : (language === "EN" ? "Add address" : "முகவரியைச் சேர்க்க") }

                </Typography>

                {address && (
                  <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {`${address.doorNo || ""} ${address.street || ""}`.trim()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box component="img" src={logo} sx={{ width: 49, height: 45, cursor: "pointer" }} onClick={() => navigate("/")} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setSearchDrawerOpen(true)}>
              <SearchIcon sx={{color: mainTextColor}}/>
            </IconButton>

            <IconButton onClick={() => setCartOpen(true)}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon sx={{color: mainTextColor}} />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWERS */}
      <Drawer anchor="left" open={menuDrawerOpen} onClose={toggleMenuDrawer(false)}>
        <Box sx={{ width: 200 }}>
         <List>

            {/* About */}
            <ListItemButton onClick={() => { navigate("/about"); setMenuDrawerOpen(false); }}>
              <ListItemText primary={language === "EN" ? "About Us" : "எங்களைப் பற்றி"} />
            </ListItemButton>
            <Divider />

            {/* Contact */}
            <ListItemButton onClick={() => { navigate("/contact"); setMenuDrawerOpen(false); }}>
              <ListItemText primary={language === "EN" ? "Contact Us" : "தொடர்பு"} />
            </ListItemButton>
            <Divider />

            {/* 🔥 WHEN LOGGED IN → Show Account Menu Like Laptop */}
            {isLoggedIn ? (
              <>
                <ListItemButton onClick={() => { navigate("/profile"); setMenuDrawerOpen(false); }}>
                  <ListItemText 
                    primary={userName ? userName : (language === "EN" ? "My Account" : "என் கணக்கு")} 
                  />
                </ListItemButton>

                <ListItemButton onClick={() => { navigate("/orders"); setMenuDrawerOpen(false); }}>
                  <ListItemText 
                    primary={language === "EN" ? "My Orders" : "எனது ஆர்டர்கள்"} 
                  />
                </ListItemButton>

                <ListItemButton onClick={() => { navigate("/addresses"); setMenuDrawerOpen(false); }}>
                  <ListItemText 
                    primary={language === "EN" ? "Saved Addresses" : "சேமிக்கப்பட்ட முகவரிகள்"} 
                  />
                </ListItemButton>

                <Divider />

                <ListItemButton onClick={() => { handleLogout(); setMenuDrawerOpen(false); }}>
                  <ListItemText 
                    primary={language === "EN" ? "Logout" : "வெளியேறு"} 
                  />
                </ListItemButton>
              </>
            ) : (
              /* 🔥 WHEN LOGGED OUT → Show Login */
              <ListItemButton onClick={() => { setLoginDrawerOpen(true); setMenuDrawerOpen(false); }}>
                <ListItemText 
                  primary={language === "EN" ? "Login / Register" : "உள்நுழைவு / பதிவு"} 
                />
              </ListItemButton>
            )}

          </List>

        </Box>
      </Drawer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AddressFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingAddress(null); }}
        onSaved={(saved) => { handleSavedAddress(saved); setFormOpen(false); setEditingAddress(null); }}
        defaultValues={editingAddress}
        isLoggedIn={isLoggedIn}
        userId={userId}
      />

      <AddressListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={handleSelectAddress}
        selectedAddressId={address?._id}
        onAddNew={() => { setListOpen(false); setEditingAddress(null); setFormOpen(true); }}
        onEdit={(addr) => { setListOpen(false); setEditingAddress(addr); setFormOpen(true); }}
        isLoggedIn={isLoggedIn}
        userId={userId}
      />

      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />

      <Menu anchorEl={accountAnchorEl} open={Boolean(accountAnchorEl)} onClose={handleAccountMenuClose}>
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/profile"); }}>
          {userName}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/orders"); }}>
          {language === "EN" ? "My Orders" : "எனது ஆர்டர்கள்"}
        </MenuItem>
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate("/addresses"); }}>
          {language === "EN" ? "Saved Addresses" : "சேமிக்கப்பட்ட முகவரிகள்"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "#D32F2F" }}>
           {language === "EN" ? "Logout" : "வெளியேறு"}
        </MenuItem>
      </Menu>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); navigate("/about"); }}>
         {language === "EN" ? "About Us" : "எங்களைப் பற்றி"}
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate("/contact"); }}>
        {language === "EN" ? "Contact Us" : "தொடர்பு"}
        </MenuItem>
      </Menu>

      <SearchDrawer open={searchDrawerOpen} onClose={() => setSearchDrawerOpen(false)} onSearch={(term) => navigate(`/search?query=${encodeURIComponent(term)}`)} />
    </>
  );
};

export default MainNavbar;