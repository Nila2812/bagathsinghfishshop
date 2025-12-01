// src/components/PaymentComponent.jsx - WITH WORKING COD + COMING SOON FOR ONLINE

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoneyIcon from "@mui/icons-material/Money";
import LockIcon from "@mui/icons-material/Lock";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "./LanguageContext";

const BRAND_COLOR = "#D31032";

export default function PaymentComponent({ 
  onPaymentSuccess, 
  onPaymentError,
  selectedAddress,
  grandTotal
}) {
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 🔥 DEFAULT TO COD
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const { cartItems, clearCart } = useCart();
  const authContext = useAuth();
  const { language } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔥 GET USER DATA - SAME AS OLD CODE
  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    userId: null,
    user: null,
  });

  useEffect(() => {
    let isLoggedIn = authContext?.isLoggedIn;
    let user = authContext?.user;
    let userId = user?._id || user?.id;

    // Fallback to localStorage if context is not ready
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

  // 🔥 CALCULATE ITEM PRICE - SAME AS OLD CODE
  const calculateItemPrice = (item) => {
    const { productSnapshot, totalWeight, unit } = item;
    const toGrams = (value, unitType) => {
      if (unitType === "kg") return value * 1000;
      if (unitType === "g") return value;
      return value;
    };
    const addedInGrams = toGrams(totalWeight, unit);
    const priceForInGrams = toGrams(
      productSnapshot.weightValue,
      productSnapshot.weightUnit
    );
    const ratio = addedInGrams / priceForInGrams;
    return ratio * productSnapshot.price;
  };

  // 🔥 DELIVERY FEE - SAME AS OLD CODE
  const getDeliveryFee = (amount) => {
    if (amount < 200) return 40;
    if (amount >= 200 && amount < 500) return 30;
    if (amount >= 500 && amount < 1000) return 20;
    return 0;
  };

  // 🔥 HANDLE PAYMENT - COD WORKS AS OLD, ONLINE SHOWS ALERT
  const handlePayment = async () => {
    // 🔥 ONLINE PAYMENT METHODS - COMING SOON
    if (paymentMethod !== "cod") {
      alert("🚧 Online payment coming soon! Please use Cash on Delivery (COD) for now.");
      return;
    }

    // 🔥 COD PAYMENT - EXACT SAME AS OLD CODE
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!authData.userId) {
      setError("User information not found. Please login again.");
      return;
    }

    setPlacingOrder(true);
    setError(null);

    try {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + calculateItemPrice(item),
        0
      );
      const deliveryCharge = getDeliveryFee(totalAmount);
      const finalGrandTotal = totalAmount + deliveryCharge;

      const orderData = {
        userId: authData.userId,
        amount: finalGrandTotal * 100,
        currency: "INR",
        cartItems: cartItems.map((item) => ({
          productId: item.productId?._id || item.productId,
          totalWeight: item.totalWeight,
          unit: item.unit,
          productSnapshot: item.productSnapshot,
        })),
        selectedAddress: selectedAddress,
        paymentMethod: "COD",
        totalAmount: totalAmount,
        deliveryCharge: deliveryCharge,
        grandTotal: finalGrandTotal,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      // 🔥 HANDLE STOCK VALIDATION ERRORS
      if (!response.ok) {
        if (data.error === 'STOCK_VALIDATION_FAILED' && data.stockErrors) {
          setError(data.message || 'Stock validation failed');
          setPlacingOrder(false);
          
          // Pass stock errors to parent if needed
          if (onPaymentError) {
            onPaymentError({ stockErrors: data.stockErrors, message: data.message });
          }
          return;
        }
        
        throw new Error(data.error || "Failed to create order");
      }

      console.log("✅ Order created:", data.orderId);

      await clearCart();
      
      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess({ orderId: data.orderId });
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
      setPlacingOrder(false);
      
      if (onPaymentError) {
        onPaymentError(err);
      }
    }
  };

  const paymentMethods = [
    {
      id: "cod",
      label: language === "EN" ? "Cash on Delivery (COD)" : "பணம் வழங்கல் (COD)",
      icon: MoneyIcon,
      description: language === "EN" ? "Pay when order is delivered" : "ஆர்டர் வந்ததும் பணம் செலுத்தவும்",
      available: true, // 🔥 COD IS AVAILABLE
    },
    {
      id: "card",
      label: language === "EN" ? "Credit/Debit Card" : "கார்டு கட்டணம்",
      icon: CreditCardIcon,
      description: language === "EN" ? "Coming Soon" : "விரைவில்",
      available: false, // 🔥 NOT AVAILABLE YET
    },
    {
      id: "upi",
      label: language === "EN" ? "UPI" : "UPI கட்டணம்",
      icon: PhoneAndroidIcon,
      description: language === "EN" ? "Coming Soon" : "விரைவில்",
      available: false, // 🔥 NOT AVAILABLE YET
    },
    {
      id: "netbanking",
      label: language === "EN" ? "Net Banking" : "நெட் பேங்கிங்",
      icon: AccountBalanceIcon,
      description: language === "EN" ? "Coming Soon" : "விரைவில்",
      available: false, // 🔥 NOT AVAILABLE YET
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {language === "EN" ? "Payment Method" : "கட்டண முறைகள்"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {language === "EN"
            ? "Choose your preferred payment option to complete the order"
            : "ஆர்டரை முடிக்க விரும்பும் கட்டண முறையைத் தேர்ந்தெடுக்கவும்"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Order Summary Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 2,
          bgcolor: `${BRAND_COLOR}08`,
          border: `1px solid ${BRAND_COLOR}20`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {language === "EN" ? "Total Amount to Pay" : "மொத்த தொகை"}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: BRAND_COLOR }}
            >
              ₹{grandTotal ? grandTotal.toFixed(2) : "0.00"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {language === "EN" ? "Items in Cart" : "பொருட்கள்"}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {cartItems.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Payment Methods Selection */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {language === "EN" ? "Select Payment Method" : "கட்டண முறையைத் தேர்வு செய்யவும்"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;
            const isAvailable = method.available;

            return (
              <Card
                key={method.id}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  border: isSelected
                    ? `2px solid ${BRAND_COLOR}`
                    : `1px solid ${theme.palette.divider}`,
                  bgcolor: isSelected 
                    ? `${BRAND_COLOR}05` 
                    : !isAvailable 
                    ? theme.palette.grey[50]
                    : "transparent",
                  opacity: !isAvailable ? 0.6 : 1,
                  transition: "all 0.3s",
                  "&:hover": isAvailable ? {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderColor: BRAND_COLOR,
                  } : {},
                }}
                onClick={() => {
                  if (isAvailable) {
                    setPaymentMethod(method.id);
                  } else {
                    alert("🚧 This payment method is coming soon! Please use COD for now.");
                  }
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: isSelected
                          ? `${BRAND_COLOR}15`
                          : theme.palette.grey[100],
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 24,
                          color: isSelected ? BRAND_COLOR : theme.palette.text.secondary,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? BRAND_COLOR : theme.palette.text.primary,
                        }}
                      >
                        {method.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={!isAvailable ? "error" : "text.secondary"}
                        sx={{ 
                          display: "block",
                          fontWeight: !isAvailable ? 600 : 400
                        }}
                      >
                        {method.description}
                      </Typography>
                    </Box>
                  </Box>
                  {!isAvailable && (
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: theme.palette.warning.light,
                        color: theme.palette.warning.dark,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {language === "EN" ? "Soon" : "விரைவில்"}
                    </Typography>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Paper>

      {/* Security Info */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "#E8F5E9",
          border: "1px solid #81C784",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LockIcon sx={{ color: "#2E7D32", fontSize: 20, flexShrink: 0 }} />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1B5E20", mb: 0.25 }}
            >
              {language === "EN" ? "Your payment is secure" : "உங்கள் கட்டணம் பாதுகாப்பாகும்"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#2E7D32" }}
            >
              {language === "EN"
                ? "All transactions are protected with SSL encryption"
                : "அனைத்து பரிவர்த்தனைகளும் SSL குறியாக்கத்துடன் பாதுகாக்கப்படுகின்றன"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 🔥 COD INFO BOX */}
      {paymentMethod === "cod" && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#FFF9E6",
            border: "1px solid #FFE082",
            mb: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#F57C00", mb: 0.5 }}
          >
            💵 {language === "EN" ? "Cash on Delivery Selected" : "பணம் வழங்கல் தேர்வு செய்யப்பட்டது"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#E65100" }}
          >
            {language === "EN"
              ? "Pay with cash when your order is delivered to your doorstep"
              : "உங்கள் வீட்டு வாசலில் ஆர்டர் வந்ததும் பணம் செலுத்தவும்"}
          </Typography>
        </Paper>
      )}

      {/* Action Button */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={placingOrder || !grandTotal || grandTotal <= 0}
          onClick={handlePayment}
          sx={{
            bgcolor: BRAND_COLOR,
            py: 1.75,
            fontSize: { xs: "15px", sm: "16px" },
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${BRAND_COLOR}40`,
            "&:hover": {
              bgcolor: "#b40d2c",
              boxShadow: `0 6px 16px ${BRAND_COLOR}50`,
            },
            "&:disabled": {
              bgcolor: theme.palette.grey[300],
            },
          }}
        >
          {placingOrder ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} sx={{ color: "#fff" }} />
              {language === "EN" ? "Placing Order..." : "ஆர்டர் செய்கிறது..."}
            </Box>
          ) : paymentMethod === "cod" ? (
            language === "EN"
              ? `Place Order (₹${grandTotal?.toFixed(2)})`
              : `ஆர்டர் செய் (₹${grandTotal?.toFixed(2)})`
          ) : (
            language === "EN"
              ? `Pay ₹${grandTotal?.toFixed(2)}`
              : `₹${grandTotal?.toFixed(2)} செலுத்து`
          )}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", px: 1 }}
        >
          {language === "EN"
            ? "By placing order, you agree to complete this purchase. Your details are secure."
            : "ஆர்டர் செய்வதன் மூலம், இந்த வாங்குதலை நிறைவு செய்வதை ஒப்புக்கொள்கிறீர்கள்."}
        </Typography>
      </Box>
    </Box>
  );
}