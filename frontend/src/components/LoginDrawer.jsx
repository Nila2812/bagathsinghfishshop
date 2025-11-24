// src/components/LoginDrawer.jsx - FINAL VERSION WITH FIXED TIMING

import React, { useState, useEffect } from "react";
import {
  Drawer, Box, Typography, TextField, Button, IconButton, Divider,
  Backdrop, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  CircularProgress, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getClientId } from "../utils/clientId";

const LoginDrawer = ({ open, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // OTP Timer & Rate Limiting States
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState(null);
  const [verificationLimitReached, setVerificationLimitReached] = useState(false);

  // Check if device is blocked on mount
  useEffect(() => {
    if (open) {
      checkDeviceBlock();
    }
  }, [open]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !verificationLimitReached) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, verificationLimitReached]);

  const checkDeviceBlock = () => {
    const blockData = localStorage.getItem("otpBlock");
    if (blockData) {
      const { until } = JSON.parse(blockData);
      const now = Date.now();
      
      if (now < until) {
        setIsBlocked(true);
        setBlockUntil(until);
        const resetTime = new Date(until).toLocaleTimeString();
        setError(`Device blocked due to too many attempts. Try again after ${resetTime}`);
      } else {
        localStorage.removeItem("otpBlock");
        setIsBlocked(false);
        setResendCount(0);
      }
    }
  };

  const blockDevice = () => {
    const blockDuration = 3.5 * 60 * 60 * 1000; // 3.5 hours
    const until = Date.now() + blockDuration;
    localStorage.setItem("otpBlock", JSON.stringify({ until }));
    setIsBlocked(true);
    setBlockUntil(until);
    const resetTime = new Date(until).toLocaleTimeString();
    setError(`Device blocked due to too many attempts. Try again after ${resetTime}`);
  };

  const migrateGuestDataToUser = async (userId, sessionToken) => {
    const clientId = getClientId();
    
    try {
      const cartResponse = await fetch("/api/cart/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clientId })
      });

      if (cartResponse.ok) {
        const cartResult = await cartResponse.json();
        console.log(`✅ Cart: Deleted ${cartResult.deletedExistingCount} existing items, migrated ${cartResult.migratedCount} guest items`);
      }

      const addressResponse = await fetch("/api/address/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clientId })
      });

      if (addressResponse.ok) {
        const addressResult = await addressResponse.json();
        console.log(`✅ Address: Migrated ${addressResult.migratedCount} addresses`);
      }
    } catch (err) {
      console.error("❌ Error migrating data:", err);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    
    if (isBlocked) {
      checkDeviceBlock();
      return;
    }

    if (resendCount >= 3) {
      blockDevice();
      return;
    }
    
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
        
        // Start 60-second timer
        setTimer(60);
        setCanResend(false);
        setResendCount(prev => prev + 1);
        setOtpAttempts(0);
        setVerificationLimitReached(false);
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

  const handleResendOtp = async () => {
    if (!canResend || isBlocked || verificationLimitReached) return;
    
    setOtp("");
    setOtpAttempts(0);
    setVerificationLimitReached(false);
    await handleSendOtp();
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
        const newUserId = data.user.id;
        const sessionToken = data.user.sessionToken;

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", newUserId);
        localStorage.setItem("sessionToken", sessionToken);
        
        // Clear block and resend count on successful login
        localStorage.removeItem("otpBlock");
        setResendCount(0);
        setIsBlocked(false);
        
        console.log(`🔐 Login successful for ${mobile}`);
        
        await migrateGuestDataToUser(newUserId, sessionToken);
        window.dispatchEvent(new Event("loginSuccess"));

        if (data.isNewUser) {
          setStep(3);
        } else {
          setStep(4);
          onLoginSuccess && onLoginSuccess();

        }
        setError("");
      } else {
        // Track failed attempts
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);

        if (newAttempts >= 4) {
          // 🔥 FIXED: Stop timer when verification limit reached
          setTimer(0);
          setCanResend(false);
          setVerificationLimitReached(true);
          
          // Check if this is the 3rd resend (final attempt)
          if (resendCount >= 3) {
            blockDevice();
          } else {
            setError("OTP verification limit exceeded. Please request a new OTP.");
          }
          setOtp("");
        } else {
          setError(`Invalid OTP. ${4 - newAttempts} attempt${4 - newAttempts > 1 ? 's' : ''} remaining.`);
        }
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, name, email, gender, sessionToken })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("loginSuccess"));
        setStep(4);
        onLoginSuccess && onLoginSuccess();
        setError("");
      } else if (data.forceLogout) {
        setError("Session expired. Logged in from another device. Please login again.");
        handleReset();
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
    setTimer(0);
    setCanResend(false);
    setOtpAttempts(0);
    setVerificationLimitReached(false);
    onClose();
  };

  return (
    <>
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
            sx={{ position: "absolute", top: 10, right: 10, color: "#444" }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 700, color: "#C21807", mt: 1, mb: 1 }}>
            Bagathsingh Fish Shop
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#555", mb: 3 }}>
            For the love of meat!
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Error/Warning Messages */}
          {error && (
            <Alert severity={isBlocked ? "error" : "warning"} sx={{ mb: 2 }}>
              {error}
            </Alert>
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
                disabled={isBlocked}
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
                disabled={loading || mobile.length !== 10 || isBlocked}
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
                sx={{ mb: 2 }}
                helperText="Check your terminal/console for OTP"
                disabled={verificationLimitReached}
              />

              {/* 🔥 FIXED: Timer only shows when NOT at verification limit */}
              {!verificationLimitReached && timer > 0 && (
                <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}>
                  Resend OTP available in <strong>{timer}s</strong>
                </Typography>
              )}

              {/* 🔥 FIXED: Resend button logic */}
              {canResend && !verificationLimitReached && resendCount < 3 && (
                <Button
                  variant="text"
                  fullWidth
                  onClick={handleResendOtp}
                  sx={{ mb: 2, textTransform: "none" }}
                >
                  Resend OTP ({3 - resendCount} remaining)
                </Button>
              )}

              {/* 🔥 NEW: Show resend button when verification limit reached (but not device blocked) */}
              {verificationLimitReached && !isBlocked && resendCount < 3 && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleResendOtp}
                  sx={{
                    mb: 2,
                    backgroundColor: "#FF9800",
                    "&:hover": { backgroundColor: "#F57C00" },
                    textTransform: "none"
                  }}
                >
                  Request New OTP ({3 - resendCount} remaining)
                </Button>
              )}

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
                disabled={loading || otp.length !== 4 || verificationLimitReached}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Verify OTP"}
              </Button>
              
              <Button
                variant="text"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setTimer(0);
                  setOtpAttempts(0);
                  setVerificationLimitReached(false);
                }}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Edit Mobile Number
              </Button>
            </Box>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Complete Your Profile
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                You're logged in! Just a few more details...
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
              
              <Button
                variant="text"
                onClick={handleReset}
                sx={{ mt: 1, textTransform: "none", width: "100%" }}
              >
                Skip for now
              </Button>
            </Box>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Box textAlign="center" sx={{ mt: 10 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#2E7D32", mb: 2 }}>
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