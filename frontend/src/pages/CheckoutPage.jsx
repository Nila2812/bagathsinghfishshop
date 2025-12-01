// src/pages/CheckoutPage.jsx - UPDATED WITH PAYMENT COMPONENT + HOME BUTTON

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Topbar from "../components/Topbar";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import OrderSummary from "../components/OrderSummary";
import CheckoutAddressList from "../components/CheckoutAddressList";
import AddressFormModal from "../components/AddressFormModal";
import PaymentComponent from "../components/PaymentComponent";
import { useLanguage } from "../components/LanguageContext"; 

const steps = ["Select Address", "Order Summary", "Payment Method"];
const BRAND_COLOR = "#D31032";
// ✅ Define font families clearly at the top
const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";
export default function CheckoutPage() {
   const { language } = useLanguage();
   const steps = language === "TA"
  ? ["முகவரியை தேர்வு செய்", "ஆர்டர் விவரம்", "கட்டணம்"]
  : ["Select Address", "Order Summary", "Payment Method"];
   const { user } = useAuth();
  const authContext = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const scrollContainerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [error, setError] = useState(null);
  const [stockErrors, setStockErrors] = useState([]);

  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    userId: null,
    user: null,
  });

  useEffect(() => {
    let isLoggedIn = authContext?.isLoggedIn;
    let user = authContext?.user;
    let userId = user?._id || user?.id;

    if (isLoggedIn === undefined || !userId) {
      const storedUser = localStorage.getItem("user");
      const storedUserId = localStorage.getItem("userId");

      if (storedUser && storedUserId) {
        try {
          const parsedUser = JSON.parse(storedUser);
          isLoggedIn = true;
          userId = storedUserId;
          user = parsedUser;
        } catch (err) {
          console.error("Error parsing stored user:", err);
        }
      }
    }

    setAuthData({ isLoggedIn, userId, user });
  }, [authContext]);

  useEffect(() => {
    if (!isLargeScreen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepWidth = container.scrollWidth / steps.length;
      container.scrollTo({
        left: stepWidth * activeStep,
        behavior: "smooth",
      });
    }
  }, [activeStep, isLargeScreen]);

  const handleEdit = (address) => {
    setEditAddress(address);
    setOpenAddressForm(true);
  };

  const handleAddressSaved = (newAddress) => {
    setOpenAddressForm(false);
    setEditAddress(null);
    setRefreshFlag((prev) => prev + 1);

    if (newAddress?._id) {
      setSelectedAddress(newAddress);
      setActiveStep(1);
    }
  };

  const handleStepClick = (index) => {
    if (index < activeStep) {
      setActiveStep(index);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log("✅ Payment successful:", paymentData);
    await clearCart();
    navigate(`/order-success?orderId=${paymentData.orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error("❌ Payment error:", error);
    setError(error.message || "Payment failed. Please try again.");
  };

  const renderMainContent = () => {
    if (activeStep === 0) {
      return (
        <Box sx={{ width: "100%" }}>
          <CheckoutAddressList
            userId={authData.userId}
            isLoggedIn={authData.isLoggedIn}
            selectedAddressId={selectedAddress?._id}
            onSelect={(addr) => {
              setSelectedAddress(addr);
              setActiveStep(1);
            }}
            onEdit={handleEdit}
            onAddNew={() => {
              setEditAddress(null);
              setOpenAddressForm(true);
            }}
            onContinue={() => selectedAddress && setActiveStep(1)}
            refreshFlag={refreshFlag}
          />
        </Box>
      );
    }

    if (activeStep === 1) {
      return (
        <OrderSummary
          onNext={() => setActiveStep(2)}
          onGrandTotalChange={setGrandTotal}
        />
      );
    }
 if (activeStep === 1) {
      return (
        <OrderSummary 
          onNext={() => setActiveStep(2)}
          onGrandTotalChange={(total) => {
            console.log("OrderSummary sending grandTotal:", total);
            setGrandTotal(total);
          }}
        />
      );
    }
    if (activeStep === 2) {
      return (
        <Box sx={{ width: "100%" }}>
          {stockErrors.length > 0 && (
            <Alert 
              severity="error" 
              icon={<ErrorOutlineIcon />}
              sx={{ mb: 3 }}
              onClose={() => setStockErrors([])}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Stock Validation Failed
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The following products have stock issues:
              </Typography>
              
              <List dense sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1 }}>
                {stockErrors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {error.productName}
                          </Typography>
                          <Chip 
                            label={error.error === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Insufficient Stock'} 
                            size="small"
                            color="error"
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'inherit' }}>
                          {error.message}
                          {error.orderedQty && error.availableStock && (
                            <>
                              <br />
                              Ordered: {error.orderedQty} | Available: {error.availableStock}
                            </>
                          )}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                Please return to your cart to adjust quantities or remove unavailable items.
              </Typography>
            </Alert>
          )}

          {error && !stockErrors.length && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <PaymentComponent
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            selectedAddress={selectedAddress}
            grandTotal={grandTotal}
          />

          <Button
            fullWidth
            variant="text"
            sx={{ color: BRAND_COLOR, mt: 2 }}
            onClick={() => setActiveStep(1)}
          >
            ← Back to Order Summary
          </Button>
        </Box>
      );
    }
  };

  const renderMobileProgress = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* 🔥 MOBILE HEADER WITH HOME BUTTON */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        px: 2,
        pt: 2,
        pb: 1,
      }}>
        <Button
          startIcon={<Box sx={{ fontSize: 18 }}>←</Box>}
          onClick={() => navigate("/")}
          sx={{
            color: BRAND_COLOR,
            fontWeight: 600,
            fontSize: "0.85rem",
            textTransform: "none",
            minWidth: "auto",
            px: 1,
          }}
        >
          Home
        </Button>
        
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Checkout
        </Typography>
        
        <Box sx={{ width: 60 }} />
      </Box>

      {/* PROGRESS STEPS */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 0,
          px: 2,
          py: 1.5,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = isCompleted;

          return (
            <Box
              key={label}
              onClick={() => isClickable && handleStepClick(index)}
              sx={{
                minWidth: "33.33%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isClickable ? "pointer" : "default",
                position: "relative",
                opacity: isClickable ? 1 : isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
                "&:hover": isClickable ? { opacity: 0.8 } : {},
              }}
            >
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    right: "-50%",
                    height: 2,
                    bgcolor: isCompleted ? BRAND_COLOR : theme.palette.divider,
                    zIndex: 0,
                  }}
                />
              )}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isActive || isCompleted ? BRAND_COLOR : "#fff",
                  border: `2px solid ${isActive || isCompleted ? BRAND_COLOR : theme.palette.divider}`,
                  zIndex: 1,
                  mb: 0.8,
                  transition: "all 0.2s",
                }}
              >
                {isCompleted && (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "#fff" }} />
                )}
                {isActive && !isCompleted && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "11px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive || isCompleted ? BRAND_COLOR : theme.palette.text.secondary,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const renderDesktopProgress = () => (
   
    <Box
      sx={{
        width: 320,
        flexShrink: 0,
        p: 4,
        mt:2,
        boxSizing: "border-box",
        bgcolor: theme.palette.grey[50],
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {language === "EN" ? "Checkout Progress" : "செக்அவுட் முன்னேற்றம்"}
      </Typography>

      {/* 🔥 HOME BUTTON - DESKTOP */}
      <Button
        startIcon={<Box sx={{ fontSize: 20 }}>←</Box>}
        onClick={() => navigate("/")}
        sx={{
          color: BRAND_COLOR,
          fontWeight: 600,
          fontSize: "0.9rem",
          textTransform: "none",
          mb: 3,
          px: 0,
          justifyContent: "flex-start",
          "&:hover": {
            backgroundColor: "transparent",
            textDecoration: "underline",
          }
        }}
      >
        Home
      </Button>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = isCompleted;

          return (
            <Box key={label} sx={{ position: "relative" }}>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 11,
                    top: 36,
                    bottom: -20,
                    width: 2,
                    bgcolor: isCompleted ? BRAND_COLOR : theme.palette.divider,
                  }}
                />
              )}
              <Box
                onClick={() => isClickable && handleStepClick(index)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  py: 2,
                  cursor: isClickable ? "pointer" : "default",
                  transition: "all 0.2s",
                  "&:hover": isClickable ? { transform: "translateX(4px)" } : {},
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isCompleted ? BRAND_COLOR : isActive ? BRAND_COLOR : "#fff",
                    border: `2px solid ${isActive || isCompleted ? BRAND_COLOR : theme.palette.divider}`,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {isCompleted && (
                    <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
                  )}
                  {isActive && !isCompleted && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: isActive ? 700 : 500,
                      color: isActive || isCompleted ? BRAND_COLOR : theme.palette.text.secondary,
                      mb: 0.5,
                    }}
                  >
                    {label}
                  </Typography>
                  {isCompleted && (
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                     {language === "EN" ? "Completed ✓" : "முடிந்தது ✓"}
                    </Typography>
                  )}
                  {isActive && (
                    <Typography variant="caption" sx={{ color: BRAND_COLOR, fontWeight: 600 }}>
                     {language === "EN" ? "Current Step" : "நடப்பு நிலை"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <>
      <Topbar />   {/* ✅ Add here */}
      <Box
        sx={{
          fontFamily: language === "TA" ? tamilFont : englishFont,
          display: "flex",
          minHeight: isLargeScreen ? "100vh" : "auto",
          flexDirection: { xs: "column", lg: "row" },
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          p: 0,
          m: 0,
          boxSizing: "border-box",
        }}
      >
        {isLargeScreen ? renderDesktopProgress() : renderMobileProgress()}

        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: '100%',
            mt:{ xs: 0, lg: 2 },
            maxWidth: '100%',
            height: { lg: "100vh" },
            overflowY: { lg: "auto" },
            overflowX: "hidden",
            p: { xs: 2, sm: 3, lg: 4 },
            bgcolor: "#fff",
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            {renderMainContent()}
          </Box>
        </Box>
      </Box>

      <AddressFormModal
        open={openAddressForm}
        defaultValues={editAddress}
        userId={authData.userId}
        isLoggedIn={authData.isLoggedIn}
        onClose={() => setOpenAddressForm(false)}
        onSaved={handleAddressSaved}
      />
       
    </>
  );
}