import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Backdrop,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LoginDrawer = ({ open, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Profile (new user), 4: Success
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // User is already logged in
    }
  }, []);

  const handleSendOtp = async () => {
    setError("");
    
    // Validate mobile
    const isValid = /^[6-9]\d{9}$/.test(mobile);
    if (!isValid) {
      setError("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile })
      });

      const data = await response.json();

      if (data.success) {
        setIsNewUser(data.isNewUser);
        setStep(2);
        setError("");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Send OTP Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");

    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp })
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser) {
          // New user - go to profile completion (don't login yet)
          setStep(3);
        } else {
          // Existing user - LOGIN NOW!
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userId", data.user.id);
          
          // 🔥 Trigger navbar update
          window.dispatchEvent(new Event("loginSuccess"));
          
          setStep(4);
          onLoginSuccess && onLoginSuccess();

        }
        setError("");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Verify OTP Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    setError("");

    if (!name || !email || !gender) {
      setError("Please fill all the fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, name, email, gender })
      });

      const data = await response.json();

      if (data.success) {
        // 🔥 FIX: Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.id);
        
        // 🔥 FIX: Trigger navbar update for new users!
        window.dispatchEvent(new Event("loginSuccess"));
        
        setStep(4);
        onLoginSuccess && onLoginSuccess();
        setError("");
      } else {
        setError(data.message || "Failed to complete profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Complete Profile Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMobile("");
    setOtp("");
    setName("");
    setEmail("");
    setGender("");
    setError("");
    setIsNewUser(false);
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

          {/* Error Message */}
          {error && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: "#ffebee",
                borderRadius: 1,
                border: "1px solid #ef5350",
              }}
            >
              <Typography variant="body2" sx={{ color: "#c62828" }}>
                {error}
              </Typography>
            </Box>
          )}

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
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobile(val);
                  setError("");
                }}
                inputProps={{ maxLength: 10 }}
                sx={{ mb: 3 }}
                helperText="Enter 10-digit mobile number starting with 6-9"
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
                disabled={loading || mobile.length !== 10}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Send OTP"}
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
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setOtp(val);
                  setError("");
                }}
                inputProps={{ maxLength: 4 }}
                sx={{ mb: 3 }}
                helperText="Check your terminal/console for OTP"
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
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 4}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Verify OTP"}
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Edit Mobile Number
              </Button>
            </Box>
          )}

          {/* Step 3: Complete Profile (New Users Only) */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Complete Your Profile
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                We need a few more details to set up your account
              </Typography>

              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                sx={{ mb: 2 }}
              />

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setError("");
                  }}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>

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
                onClick={handleCompleteProfile}
                disabled={loading || !name || !email || !gender}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Complete Profile"}
              </Button>
            </Box>
          )}

          {/* Step 4: Success Message */}
          {step === 4 && (
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