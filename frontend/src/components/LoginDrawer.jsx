// src/components/LoginDrawer.jsx - FINAL FIX: NO BUTTON CHANGE ON VERIFICATION FAIL

import React, { useState, useEffect } from "react";
import {
  Drawer, Box, Typography, TextField, Button, IconButton, Divider,
  Backdrop, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  CircularProgress, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getClientId } from "../utils/clientId";
import { useLanguage } from "./LanguageContext"; 
// ✅ Define font families clearly at the top
const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const LoginDrawer = ({ open, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
   const { language } = useLanguage();
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
  const [verificationFailed, setVerificationFailed] = useState(false);

  // Check if device is blocked on mount
  useEffect(() => {
    if (open) {
      checkDeviceBlock();
    }
  }, [open]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
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
  }, [timer]);

  const checkDeviceBlock = async () => {
    try {
      const response = await fetch("/api/auth/check-device-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.isBlocked) {
        setIsBlocked(true);
        setBlockUntil(data.blockUntil);
        
        // 🔥 Format exact unlock time
        const unlockDate = new Date(data.blockUntil);
        const unlockTime = unlockDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        const unlockDateStr = unlockDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        setError(`This device is blocked due to too many attempts. Try again after ${unlockTime} on ${unlockDateStr}`);
      } else {
        setIsBlocked(false);
        setResendCount(data.resendCount || 0);
      }
    } catch (err) {
      console.error("Error checking device block:", err);
    }
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
      await checkDeviceBlock();
      return;
    }
    
    const isValid = /^[6-9]\d{9}$/.test(mobile);
    if (!isValid) {
      setError(
  language === "EN"
    ? "Please enter a valid 10-digit mobile number starting with 6-9."
    : "6-9 என்ற இலக்கத்துடன் தொடங்கும் 10-அடக்கு செல்லுபடியாகும் தொலைபேசி எண்ணை உள்ளிடவும்."
);
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
        setResendCount(data.resendCount || 0);
        setOtpAttempts(0);
        setVerificationFailed(false);
      } else if (data.blocked) {
        setIsBlocked(true);
        setBlockUntil(data.blockUntil);
        
        // 🔥 Format exact unlock time
        const unlockDate = new Date(data.blockUntil);
        const unlockTime = unlockDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        const unlockDateStr = unlockDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        setError(`Device blocked due to too many attempts. Try again after ${unlockTime} on ${unlockDateStr}`);
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
    if (!canResend || isBlocked) return;
    
    setOtp("");
    setOtpAttempts(0);
    setVerificationFailed(false);
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
          // 🔥 CRITICAL FIX: Only disable input and show warning
          // DO NOT change button visibility or stop timer
          setVerificationFailed(true);
          setError(`Too many incorrect attempts. Please wait for the timer to finish or request a new OTP.`);
          setOtp("");
        } else {
          setError(`Invalid OTP. ${4 - newAttempts} attempt${4 - newAttempts > 1 ? 's' : ''} remaining.`);
        }

        // Check if device should be blocked
        if (data.blocked) {
          setIsBlocked(true);
          setBlockUntil(data.blockUntil);
          
          // 🔥 Format exact unlock time
          const unlockDate = new Date(data.blockUntil);
          const unlockTime = unlockDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          const unlockDateStr = unlockDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
          
          setError(`Device blocked. Try again after ${unlockTime} on ${unlockDateStr}`);
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
    setVerificationFailed(false);
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
            width: { xs: "100%", sm: 420 },
            boxShadow: "-8px 0px 24px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Box sx={{ p: 3, position: "relative", height: "100%" , 
          fontFamily: language === "TA" ? tamilFont : englishFont,}}>
          <IconButton
            onClick={handleReset}
            sx={{ position: "absolute", top: 10, right: 10, color: "#444" }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 700, color: "#C21807", mt: 1, mb: 1 }}>
            {language === "EN"  ? "Bagathsingh Fish Shop" : "பகத்சிங் மீன் கடை"}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#555", mb: 3 }}>
         {language === "EN" ? "Your fresh food journey starts here" : "சுத்தமான உணவு பயணம் இங்கிருந்து!"}
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
              {language === "EN" ? "Sign In / Sign Up" : "சைன் இன் / பதிவு செய்யவும்"}
              </Typography>
              <TextField
                label={ language === "EN" ? "Mobile Number" : "தொலைபேசி எண்"}
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
                helperText={language === "EN" 
                ? "Enter 10-digit mobile number starting with 6-9"
                : "6-9 என்ற இலக்கத்துடன் தொடங்கும் 10-அடக்கு தொலைபேசி எண்ணை உள்ளிடவும்"
              }
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
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> 
                : language === "EN" ? ("Send OTP") : ("OTP அனுப்பு" )}
              </Button>
            </Box>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                { language === "EN" ? "Enter OTP" : "OTP உள்ளிடவும்"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
               {language === "EN" 
                ? <>OTP sent to <strong>{mobile}</strong></> 
                : <>OTP அனுப்பப்பட்டது: <strong>{mobile}</strong></>}
              </Typography>
              
              <TextField
                label={language === "EN" ? "Enter 4-digit OTP" : "4-அடக்கு OTP உள்ளிடவும்"}
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
                disabled={verificationFailed || isBlocked}
              />

              {/* 🔥 Timer Display - ALWAYS shows during countdown */}
              {timer > 0 && (
                <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}>
                 {language === "EN"
                  ? <>Resend OTP available in <strong>{timer}s</strong></>
                  : <>OTP மறுபரிசோதனை செய்யும் நேரம்: <strong>{timer} வினாடிகள்</strong></>}
                </Typography>
              )}

              {/* 🔥 CRITICAL: Resend button ONLY shows when timer reaches 0 */}
              {/* It does NOT appear when verification fails - timer keeps running */}
              {timer === 0 && canResend && !isBlocked && resendCount < 3 && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleResendOtp}
                  sx={{ 
                    mb: 2, 
                    textTransform: "none",
                    borderColor: "#FF9800",
                    color: "#FF9800",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#F57C00",
                      backgroundColor: "rgba(255, 152, 0, 0.04)",
                      borderWidth: 2
                    }
                  }}
                >
                {language === "EN" 
              ? `Resend OTP (${3 - resendCount} remaining)` 
              : `OTP மீண்டும் அனுப்பு (${3 - resendCount} மீதம்)`}

                </Button>
              )}

              {/* Verify Button */}
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
                disabled={loading || otp.length !== 4 || verificationFailed || isBlocked}
              >
               {loading 
              ? <CircularProgress size={24} sx={{ color: "#fff" }} /> 
              : language === "EN" 
                  ? "Verify OTP" 
                  : "OTP சரிபார்க்கவும்"}

              </Button>
              
              <Button
                variant="text"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setTimer(0);
                  setOtpAttempts(0);
                  setVerificationFailed(false);
                }}
                sx={{ mt: 1, textTransform: "none" }}
              >
               {language === "EN" ? "Edit Mobile Number" : "தொலைபேசி எண்ணை திருத்தவும்"}
              </Button>
            </Box>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {language === "EN" ? "Complete Your Profile" : "சுயவிவரத்தை முடிக்கவும்"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                {language === "EN" 
                  ? "You're logged in! Just a few more details..." 
                  : "சில கூடுதல் விவரங்கள் கொடுக்கவும்..."}
              </Typography>

              <TextField
                label={language === "EN" ? "Full Name" : "முழு பெயர்"}
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
                label={language === "EN" ? "Email Address" : "மின்னஞ்சல் முகவரி"}
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
                <FormLabel component="legend">{language === "EN" ? "Gender" : "பாலினம்"}</FormLabel>
                <RadioGroup
                  row
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setError("");
                  }}
                >
                  <FormControlLabel value="Male" control={<Radio />} label={ language === "EN" ? "Male" : "ஆண்"}/>
                  <FormControlLabel value="Female" control={<Radio />} label={language === "EN" ? "Female" : "பெண்"} />
                  <FormControlLabel value="Other" control={<Radio />} label={language === "EN" ? "Other" : "மற்றவை"} />
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
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} />  : language === "EN" 
                  ? "Complete Profile" 
                  : "சுயவிவரம் முடிக்கவும்"}
              </Button>
              
              <Button
                variant="text"
                onClick={handleReset}
                sx={{ mt: 1, textTransform: "none", width: "100%" }}
              >
                {language === "EN" ? "Skip for now" : "இப்போதே தவிர்க்கவும்"}
              </Button>
            </Box>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Box textAlign="center" sx={{ mt: 10 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#2E7D32", mb: 2 }}>
                {language === "EN" ? "🎉 Login Successful!" : "🎉 புகுபதிவு வெற்றிகரமாகியது!"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
               {language === "EN" ? "Welcome to Bagathsingh Fish Shop! Enjoy shopping." : "பகத்சிங் மீன் கடைக்கு வரவேற்கிறோம்! வாங்குவதை அனுபவிக்கவும்."}
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
               {language === "EN" ? "Continue" : "தொடரவும்"}
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              mt:1,
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