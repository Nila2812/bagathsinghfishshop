import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Topbar from "../components/Topbar";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import OrderSummary from "../components/OrderSummary";
import CheckoutAddressList from "../components/CheckoutAddressList";
import AddressFormModal from "../components/AddressFormModal";
import PaymentComponent from "../components/PaymentComponent";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../components/LanguageContext"; 
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
  const { cartItems, clearCart } = useCart();
  const authContext = useAuth();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const scrollContainerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [successDialog, setSuccessDialog] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);

  // 🔥 FIX: Get auth data with fallback to localStorage
  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    userId: null,
    user: null
  });

  useEffect(() => {
    // Try to get from context first
    let isLoggedIn = authContext?.isLoggedIn;
    let user = authContext?.user;
    let userId = user?._id || user?.id;

    // 🔥 Fallback to localStorage if context is not ready
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
    
    console.log('🔐 CheckoutPage Auth State:', { 
      isLoggedIn, 
      userId,
      user,
      fromContext: authContext?.isLoggedIn !== undefined,
      fromLocalStorage: !!localStorage.getItem("user")
    });
  }, [authContext]);

  // Auto-scroll to active step on mobile
  useEffect(() => {
    if (!isLargeScreen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepWidth = container.scrollWidth / steps.length;
      container.scrollTo({
        left: stepWidth * activeStep,
        behavior: 'smooth'
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
    setRefreshFlag(prev => prev + 1);

    if (newAddress?._id) {
      setSelectedAddress(newAddress);
    }
  };

  // Only allow navigation to completed steps (previous steps)
  const handleStepClick = (index) => {
    if (index < activeStep) {
      setActiveStep(index);
    }
  };
const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    setOrderId(paymentData.orderId);
    setSuccessDialog(true);
    
    // Clear cart
    if (clearCart) {
      clearCart();
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
  };

  const renderMainContent = () => {
    if (activeStep === 0) {
      return (
        <CheckoutAddressList
          userId={authData.userId}
          isLoggedIn={authData.isLoggedIn}
          selectedAddressId={selectedAddress?._id}
          onSelect={(addr) => setSelectedAddress(addr)}
          onEdit={handleEdit}
          onAddNew={() => {
            setEditAddress(null);
            setOpenAddressForm(true);
          }}
          onContinue={() => selectedAddress && setActiveStep(1)}
          refreshFlag={refreshFlag}
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
        <PaymentComponent
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          selectedAddress={selectedAddress}
          grandTotal={grandTotal}
        />
      );
    }
  };
  // Mobile horizontal progress indicator

  const renderMobileProgress = () => (
    <Box
      ref={scrollContainerRef}
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 0,
        px: 2,
        py: 2.5,
        bgcolor: '#fff',
        borderBottom: `1px solid ${theme.palette.divider}`,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        boxSizing: 'border-box',
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
              minWidth: '33.33%',
              display: 'flex',
            mt:4,
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isClickable ? 'pointer' : 'default',
              position: 'relative',
              opacity: isClickable ? 1 : isActive ? 1 : 0.6,
              transition: 'opacity 0.2s',
              '&:hover': isClickable ? { opacity: 0.8 } : {},
            }}
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: '50%',
                  right: '-50%',
                  height: 2,
                  bgcolor: isCompleted ? BRAND_COLOR : theme.palette.divider,
                  zIndex: 0,
                }}
              />
            )}

            {/* Circle Icon */}
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isActive || isCompleted ? BRAND_COLOR : '#fff',
                border: `2px solid ${isActive || isCompleted ? BRAND_COLOR : theme.palette.divider}`,
                zIndex: 1,
                mb: 0.8,
                transition: 'all 0.2s',
              }}
            >
              {isCompleted && (
                <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
              )}
              {isActive && !isCompleted && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#fff',
                  }}
                />
              )}
            </Box>

            {/* Label */}
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                color: isActive || isCompleted ? BRAND_COLOR : theme.palette.text.secondary,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  // Desktop vertical progress indicator
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
     
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, }}>
        {language === "EN" ? "Checkout Progress" : "செக்அவுட் முன்னேற்றம்"}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = isCompleted;

          return (
            <Box key={label} sx={{ position: 'relative' }}>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 11,
                    top: 36,
                    bottom: -20,
                    width: 2,
                    bgcolor: isCompleted ? BRAND_COLOR : theme.palette.divider,
                  }}
                />
              )}

              {/* Step Item */}
              <Box
                onClick={() => isClickable && handleStepClick(index)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  py: 2,
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': isClickable ? {
                    transform: 'translateX(4px)',
                  } : {},
                }}
              >
                {/* Step Icon */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted ? BRAND_COLOR : isActive ? BRAND_COLOR : '#fff',
                    border: `2px solid ${isActive || isCompleted ? BRAND_COLOR : theme.palette.divider}`,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {isCompleted && (
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />
                  )}
                  {isActive && !isCompleted && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                      }}
                    />
                  )}
                </Box>

                {/* Step Content */}
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
          flexDirection: {
            xs: "column",
            lg: "row",
          },
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          p: 0,
          m: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Progress Indicator */}
        {isLargeScreen ? renderDesktopProgress() : renderMobileProgress()}

        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: '100%',
            mt:{ xs: 0, lg: 2 },
            maxWidth: '100%',
            height: { lg: "100vh" },
            overflowY: { lg: "auto" },
            overflowX: 'hidden',
            p: { xs: 2, sm: 3, lg: 4 },
            bgcolor: "#fff",
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ 
            width: '100%', 
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            {renderMainContent()}
          </Box>
        </Box>
      </Box>

      {/* ADDRESS FORM MODAL */}
      <AddressFormModal
        open={openAddressForm}
        defaultValues={editAddress}
        userId={authData.userId}
        isLoggedIn={authData.isLoggedIn}
        onClose={() => setOpenAddressForm(false)}
        onSaved={handleAddressSaved}
      />
       {/* PAYMENT SUCCESS DIALOG */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 4, pb: 3 }}>
          <TaskAltIcon
            sx={{
              fontSize: 64,
              color: "#4CAF50",
              mb: 2,
              animation: "scaleIn 0.5s ease-in-out",
              "@keyframes scaleIn": {
                from: {
                  transform: "scale(0)",
                },
                to: {
                  transform: "scale(1)",
                },
              },
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
           {language === "EN" ? "Payment Successful!" : "கட்டணம் வெற்றிகரமாக முடிந்தது!"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
           {language === "EN" ? 
            "Your order has been placed successfully." : 
            "உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது."}

          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: BRAND_COLOR, mb: 3 }}
          >
          {language === "EN" ? "Order ID:" : "ஆர்டர் எண்:"} {orderId}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            You will receive an order confirmation via email shortly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center", gap: 2 }}>
          <Button
            variant="outlined"
            sx={{ color: BRAND_COLOR, borderColor: BRAND_COLOR }}
            onClick={() => setSuccessDialog(false)}
          >
           {language === "EN" ? "Continue Shopping" : "ஷாப்பிங்கை தொடரவும்"}
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: BRAND_COLOR }}
            onClick={() => {
              setSuccessDialog(false);
              window.location.href = `/orders/${orderId}`;
            }}
          >
           {language === "EN" ? "View Order" : "ஆர்டரை பார்க்க"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}