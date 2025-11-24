import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OrderSummary from "../components/OrderSummary";
import CheckoutAddressList from "../components/CheckoutAddressList";
import AddressFormModal from "../components/AddressFormModal";

const steps = ["Select Address", "Order Summary", "Payment Method"];
const BRAND_COLOR = "#D31032";

export default function CheckoutPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const scrollContainerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

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

  const renderMainContent = () => {
    if (activeStep === 0) {
      return (
        <CheckoutAddressList
          userId={user?._id}
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

    if (activeStep === 1)
      return <OrderSummary onNext={() => setActiveStep(2)} />;

    if (activeStep === 2)
      return (
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            Payment Method
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please select your preferred payment option. (Currently mock payment is implemented.)
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              bgcolor: BRAND_COLOR,
              mt: 3,
              py: 1.5,
              "&:hover": { backgroundColor: "#b40d2c" }
            }}
            onClick={() => alert("Order Placed Successfully! (Mock)")}
          >
            Confirm & Pay
          </Button>

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
        boxSizing: "border-box",
        bgcolor: theme.palette.grey[50],
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
        Checkout Progress
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
                    bottom: -12,
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
                      Completed ✓
                    </Typography>
                  )}
                  {isActive && (
                    <Typography variant="caption" sx={{ color: BRAND_COLOR, fontWeight: 600 }}>
                      Current Step
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
      <Box
        sx={{
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
        userId={user?._id}
        onClose={() => setOpenAddressForm(false)}
        onSaved={handleAddressSaved}
      />
    </>
  );
}