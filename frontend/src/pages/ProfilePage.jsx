import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Paper, Button, Avatar, 
  Container, Chip, CircularProgress, useMediaQuery, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Components
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";
import EditProfileModal from "../components/EditProfileModal";
import { useCart } from "../context/CartContext";

const formatPrice = (price) => `₹${price}`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { addToCart, isInCart } = useCart();

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [frequentItems, setFrequentItems] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const mainColor = "#D31032"; 
  const mainText = "#282828";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = localStorage.getItem("userId");

        if (!storedUser || !userId) {
          navigate("/");
          return;
        }

        setUser(storedUser);

        // Fetch Orders with populated product details
        const orderRes = await fetch(`/api/orders/user/${userId}`);
        const orders = await orderRes.json();

        if (Array.isArray(orders) && orders.length > 0) {
          setLastOrder(orders[0]); 
          await calculateFrequentItems(orders);
        }

        // Fetch Addresses
        const addrRes = await fetch(`/api/address/${userId}?type=user`);
        const addresses = await addrRes.json();
        
        if (Array.isArray(addresses)) {
          const def = addresses.find(a => a.isDefault) || addresses[0];
          setDefaultAddress(def);
        }

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const calculateFrequentItems = async (orders) => {
    // Get ALL unique products from order history
    const allProducts = [];
    const seenIds = new Set();
    
    // Iterate through orders from newest to oldest
    for (const order of orders) {
      for (const p of order.products) {
        const id = p.productId._id || p.productId;
        
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allProducts.push({
            ...p,
            productId: typeof p.productId === 'object' ? p.productId : { _id: p.productId }
          });
        }
      }
    }

    // Fetch current stock status for ALL products
    try {
      const productIds = allProducts.map(item => 
        typeof item.productId === 'object' ? item.productId._id : item.productId
      );

      // Fetch product details to get current stock
      const productPromises = productIds.map(id => 
        fetch(`/api/products/single/${id}`).then(res => res.json())
      );

      const currentProducts = await Promise.all(productPromises);

      // Merge current product data with order history
      const itemsWithStock = allProducts.map((item, index) => {
        const currentProduct = currentProducts[index];
        return {
          ...item,
          currentStock: currentProduct?.stockQty || 0,
          isAvailable: currentProduct?.isAvailable || false,
          image: currentProduct?.image || item.image
        };
      });

      // 🔥 PRIORITY LOGIC: Show in-stock items first, then out-of-stock
      const inStockItems = itemsWithStock.filter(item => item.isAvailable && item.currentStock > 0);
      const outOfStockItems = itemsWithStock.filter(item => !item.isAvailable || item.currentStock === 0);

      // Take first 3 in-stock items, or fill with out-of-stock if less than 3
      let finalItems = [];
      
      if (inStockItems.length >= 3) {
        // If we have 3 or more in-stock items, show only those
        finalItems = inStockItems.slice(0, 3);
      } else {
        // Show all in-stock items + fill remaining with out-of-stock
        finalItems = [
          ...inStockItems,
          ...outOfStockItems.slice(0, 3 - inStockItems.length)
        ];
      }

      setFrequentItems(finalItems);
    } catch (error) {
      console.error("Error fetching product stock:", error);
      // Fallback: show first 3 items without stock info
      setFrequentItems(allProducts.slice(0, 3));
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
      }
      window.dispatchEvent(new Event("logout")); 
      localStorage.clear();
      navigate("/");
    } catch (e) {
      console.error(e);
      localStorage.clear();
      navigate("/");
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleBuyAgain = async (item) => {
    // Check if we have current stock info
    const isStockAvailable = item.isAvailable && item.currentStock > 0;

    if (!isStockAvailable) {
      return; // Do nothing if out of stock
    }

    const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;

    try {
      await addToCart(productId);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
        <CircularProgress sx={{ color: mainColor }} />
      </Box>
    );
  }

  return (
    <>
      {/* Fixed Header */}
      <Box
        sx={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1200,
          backgroundColor: "#fff", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Topbar />
        <MainNavbar />
        <CategoryBar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          mt: { xs: "125px", md: "150px", sm: "143px" },
          minHeight: "80vh",
          backgroundColor: "#fafafa",
          pb: 4
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          
          {/* Header Section */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar 
                sx={{ width: 64, height: 64, bgcolor: mainColor, fontSize: "1.5rem", boxShadow: 2 }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: mainText }}>
                  Hello, {user?.name || "Meat Lover"}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.mobile}
                </Typography>
              </Box>
            </Box>
            
            {!isMobile && (
               <Button 
                 variant="outlined" 
                 color="error" 
                 startIcon={<LogoutIcon />} 
                 onClick={handleLogoutClick}
                 sx={{ borderRadius: 2 }}
               >
                 Logout
               </Button>
            )}
          </Box>

          {/* Dashboard Cards */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            
            {/* Card A: My Profile */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  minHeight: { xs: 'auto', md: 240 },
                  border: "1px solid #e0e0e0", 
                  borderRadius: 3,
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  bgcolor: "#fff"
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>My Profile</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditModalOpen(true)}
                      sx={{ 
                        bgcolor: "#f5f5f5",
                        "&:hover": { bgcolor: mainColor, color: "#fff" }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {user?.name || "Not set"}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ wordBreak: "break-word" }}>
                        {user?.email || "No email linked"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Card B: Latest Order */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  minHeight: { xs: 'auto', md: 240 },
                  border: "1px solid #e0e0e0", 
                  borderRadius: 3,
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  bgcolor: "#fff"
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Latest Order</Typography>
                    {lastOrder && <CheckCircleIcon color="success" fontSize="small" />}
                  </Box>
                  
                  {lastOrder ? (
                    <>
                      <Chip 
                        label={lastOrder.orderStatus} 
                        color={lastOrder.orderStatus === 'Delivered' ? "success" : "warning"} 
                        size="small" 
                        sx={{ mb: 1.5, fontWeight: 600 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {new Date(lastOrder.createdAt).toDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, mb: 1 }}>
                        {lastOrder.products[0]?.name_en} 
                        {lastOrder.products.length > 1 && ` + ${lastOrder.products.length - 1} more`}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: mainColor }}>
                        {formatPrice(lastOrder.grandTotal)}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">No orders placed yet.</Typography>
                  )}
                </Box>
                
                <Button 
                  sx={{ mt: 2, textTransform: "none", color: mainColor, fontWeight: 600 }} 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/orders')}
                >
                  View Full History
                </Button>
              </Paper>
            </Grid>

            {/* Card C: Default Address */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  minHeight: { xs: 'auto', md: 240 },
                  border: "1px solid #e0e0e0", 
                  borderRadius: 3,
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  bgcolor: "#fff"
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Address</Typography>
                    <LocationOnIcon sx={{ color: mainColor }} />
                  </Box>

                  {defaultAddress ? (
                    <>
                      <Chip 
                        label={defaultAddress.saveAs} 
                        size="small" 
                        sx={{ 
                          bgcolor: "#ffebee", 
                          color: mainColor, 
                          fontWeight: 600,
                          mb: 1.5
                        }} 
                      />
                      <Typography variant="body2" sx={{ lineHeight: 1.6, color: mainText }}>
                        {defaultAddress.doorNo}, {defaultAddress.street}, <br/>
                        {defaultAddress.locality}, {defaultAddress.city} - {defaultAddress.pincode}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">No address saved.</Typography>
                  )}
                </Box>
                
                <Button 
                  sx={{ mt: 2, textTransform: "none", color: mainColor, fontWeight: 600 }} 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/addresses')} 
                >
                  Manage Addresses
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Buy Again Section */}
          {frequentItems.length > 0 && (
            <Box>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1, 
                mb: 3,
                pb: 2,
                borderBottom: "2px solid #e0e0e0"
              }}>
                <ShoppingBagIcon sx={{ color: mainColor, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Buy It Again
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {frequentItems.map((item, index) => {
                  const isStockAvailable = item.isAvailable && item.currentStock > 0;
                  const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
                  const itemInCart = isInCart(productId); // Check if in cart
                  const productImage = item.image 
                    ? (item.image.data 
                        ? `data:${item.image.contentType};base64,${item.image.data}`
                        : item.image)
                    : null;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          border: "1px solid #eee", 
                          borderRadius: 2,
                          display: "flex", 
                          alignItems: "center", 
                          gap: 2,
                          transition: "0.2s", 
                          bgcolor: "#fff",
                          opacity: isStockAvailable ? 1 : 0.6,
                          "&:hover": { 
                            borderColor: isStockAvailable ? mainColor : "#eee", 
                            boxShadow: isStockAvailable ? "0 4px 12px rgba(0,0,0,0.08)" : "none"
                          }
                        }}
                      >
                        {/* Product Image */}
                        <Box 
                          sx={{ 
                            width: 70, 
                            height: 70, 
                            bgcolor: "#f5f5f5", 
                            borderRadius: 2, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0
                          }}
                        >
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={item.name_en}
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover" 
                              }}
                            />
                          ) : (
                            <ShoppingBagIcon sx={{ color: "#ccc" }} />
                          )}
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600, 
                              lineHeight: 1.3, 
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical"
                            }}
                          >
                            {item.name_en}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                            {item.weightValue} {item.weightUnit}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color={mainColor}>
                            {formatPrice(item.price)}
                          </Typography>
                          
                          {!isStockAvailable && (
                            <Chip 
                              label="Out of Stock" 
                              size="small" 
                              color="error" 
                              sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                          
                          {isStockAvailable && item.currentStock && (
                            <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 0.5 }}>
                              Stock: {item.currentStock} {item.weightUnit === 'piece' ? 'pcs' : item.weightUnit}
                            </Typography>
                          )}
                        </Box>

                        <Button 
                          variant={itemInCart ? "contained" : "outlined"}
                          size="small" 
                          onClick={() => handleBuyAgain(item)}
                          disabled={!isStockAvailable || itemInCart}
                          startIcon={itemInCart ? <CheckIcon /> : null}
                          sx={{ 
                            borderColor: itemInCart ? mainColor : mainColor,
                            bgcolor: itemInCart ? mainColor : "transparent",
                            color: itemInCart ? "#fff" : mainColor,
                            minWidth: "95px",
                            whiteSpace: "nowrap",
                            "&:hover": { 
                              bgcolor: itemInCart ? mainColor : mainColor, 
                              color: "#fff", 
                              borderColor: mainColor 
                            },
                            "&:disabled": { 
                              borderColor: itemInCart ? mainColor : "#ccc", 
                              bgcolor: itemInCart ? mainColor : "transparent",
                              color: itemInCart ? "#fff" : "#ccc" 
                            }
                          }}
                        >
                          {itemInCart ? "Added" : (isStockAvailable ? "Add +" : "Unavailable")}
                        </Button>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Mobile Logout */}
          {isMobile && (
            <Box sx={{ mt: 6, textAlign: "center" }}>
               <Button 
                 variant="outlined" 
                 color="error" 
                 fullWidth 
                 startIcon={<LogoutIcon />} 
                 onClick={handleLogoutClick}
                 sx={{ maxWidth: 400, mx: "auto" }}
               >
                 Logout
               </Button>
            </Box>
          )}

        </Container>

        <Footer />
      </Box>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleProfileUpdate}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 2,
            py: 1,
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <WarningAmberIcon sx={{ color: "#ff9800" }} />
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? You will need to login again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleLogoutCancel}
            sx={{ 
              color: "#666",
              "&:hover": { bgcolor: "#f5f5f5" }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained"
            color="error"
            autoFocus
            sx={{
              bgcolor: mainColor,
              "&:hover": { bgcolor: "#b00d28" }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePage;