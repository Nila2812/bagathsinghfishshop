import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LoginDrawer = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    if (mobile.length === 10) {
      setStep(2);
    } else {
      alert("Please enter a valid 10-digit mobile number.");
    }
  };

  const handleConfirmOtp = () => {
    if (otp.length === 4) {
      setStep(3);
    } else {
      alert("Please enter the 4-digit OTP.");
    }
  };

  const handleReset = () => {
    setStep(1);
    setMobile("");
    setOtp("");
    onClose();
  };

  return (
    <>
      {/* Blurred background overlay */}
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer - 1,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
        }}
        onClick={handleReset}
      />

      <Drawer
        anchor="right"
        open={open}
        onClose={handleReset}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
           // borderTopLeftRadius: 12,
           // borderBottomLeftRadius: 12,
            boxShadow: "-8px 0px 24px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Box sx={{ p: 3, position: "relative", height: "100%" }}>
          <IconButton
            onClick={handleReset}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#444",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#C21807", mt: 1, mb: 1 }}
          >
            Bagathsingh Fish Shop
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#555", mb: 3 }}>
            For the love of meat!
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Step 1: Enter Mobile */}
          {step === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sign In / Sign Up
              </Typography>
              <TextField
                label="Mobile Number"
                variant="outlined"
                fullWidth
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#D32F2F",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.2,
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#B71C1C" },
                }}
                onClick={handleSendOtp}
              >
                Send OTP
              </Button>
            </Box>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Enter OTP
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                OTP sent to <strong>{mobile}</strong>
              </Typography>
              <TextField
                label="Enter 4-digit OTP"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#D32F2F",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.2,
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#B71C1C" },
                }}
                onClick={handleConfirmOtp}
              >
                Confirm OTP
              </Button>
              <Button
                variant="text"
                onClick={() => setStep(1)}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Edit Mobile Number
              </Button>
            </Box>
          )}

          {/* Step 3: Success Message */}
          {step === 3 && (
            <Box textAlign="center" sx={{ mt: 10 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#2E7D32", mb: 2 }}
              >
                🎉 Login Successful!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Welcome to Bagathsingh Fish Shop! Enjoy shopping.
              </Typography>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  backgroundColor: "#D32F2F",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.2,
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#B71C1C" },
                }}
              >
                Continue
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 16,
              color: "#777",
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            By signing in you agree to our{" "}
            <span style={{ color: "#D32F2F", cursor: "pointer" }}>
              terms and conditions
            </span>
            .
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default LoginDrawer;
