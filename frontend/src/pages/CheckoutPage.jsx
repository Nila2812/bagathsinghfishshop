import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import OrderSummary from "../components/OrderSummary";
import CheckoutAddressList from "../components/CheckoutAddressList";
import AddressFormModal from "../components/AddressFormModal";
const steps = ["Select Address", "Order Summary", "Payment Method"];

export default function CheckoutPage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  const handleEdit = (address) => {
    setEditAddress(address);
    setOpenAddressForm(true);
  };

  const renderLeftComponent = () => {
    if (activeStep === 0) {
      return (
        <CheckoutAddressList
          userId={user?._id}
          selectedAddressId={selectedAddress?._id}
          onSelect={(addr) => setSelectedAddress(addr)}
          onEdit={handleEdit}
          onAddNew={() => setOpenAddressForm(true)}
          onContinue={() => setActiveStep(1)}
        />
      );
    }

    if (activeStep === 1)
      return <OrderSummary onNext={() => setActiveStep(2)} />;

    if (activeStep === 2)
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Payment Method
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#D31032", mt: 3 }}
            onClick={() => alert("Paid")}
          >
            Pay Now
          </Button>
        </Box>
      );
  };

  return (
    <>
      {/* MAIN WRAPPER WITH RESPONSIVE DIRECTION */}
      <Box
        sx={{
          display: "flex",
          height: { lg: "100vh" },
          flexDirection: {
            xs: "column", // mobile
            sm: "column", // tablet
            md: "column",
            lg: "row", // laptop & desktop
          },
        }}
      >
        {/* RIGHT PANEL (TOP ON MOBILE, RIGHT ON DESKTOP) */}
        <Box
          sx={{
            width: { xs: "100%", lg: "30%" },
            height: { xs: "auto", lg: "100vh" },
            p: 2,
            boxSizing: "border-box",

            // BACKGROUND REMOVED
            background: "transparent",

            // NO BORDER, NO RADIUS
            border: "none",
            borderRight: { lg: "none" },

            // SCROLL ON DESKTOP ONLY
            overflowY: { lg: "auto" },

            position: { lg: "sticky" },
            top: { lg: 0 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Checkout Progress
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": { color: "#D31032" },
                      "&.Mui-completed": { color: "#D31032" },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* LEFT PANEL */}
        <Box
          sx={{
            width: { xs: "100%", lg: "70%" },
            height: { lg: "100vh" },
            overflowY: { lg: "auto" },
            p: 3,
            bgcolor: "#fff",
          }}
        >
          {renderLeftComponent()}
        </Box>
      </Box>

      {/* ADDRESS FORM MODAL */}
      <AddressFormModal
        open={openAddressForm}
        defaultValues={editAddress}
        onClose={() => setOpenAddressForm(false)}
        onSaved={() => setOpenAddressForm(false)}
      />
    </>
  );
}
