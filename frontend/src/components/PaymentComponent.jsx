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
import LockIcon from "@mui/icons-material/Lock";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const BRAND_COLOR = "#D31032";

export default function PaymentComponent({ 
  onPaymentSuccess, 
  onPaymentError,
  selectedAddress,
  grandTotal
}) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { cartItems } = useCart();
  const { user } = useAuth();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      setError("Failed to load payment gateway. Please refresh and try again.");
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Debug: Log grandTotal whenever it changes
  useEffect(() => {
    console.log("Payment Component - Grand Total:", grandTotal);
  }, [grandTotal]);

  const handlePayment = async () => {
    // Validation
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (!user?._id) {
      setError("User information not found. Please login again.");
      return;
    }

    if (!razorpayLoaded) {
      setError("Payment gateway is loading. Please wait...");
      return;
    }

    if (grandTotal <= 0) {
      setError("Invalid amount. Please check your cart.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate delivery fee based on total amount
      const subtotal = grandTotal - getDeliveryFee(grandTotal - getDeliveryFee(grandTotal));
      const deliveryFee = getDeliveryFee(grandTotal - deliveryFee);

      // Step 1: Create order on backend
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          amount: Math.round(grandTotal * 100), // Convert to paise
          currency: "INR",
          cartItems: cartItems,
          selectedAddress: selectedAddress,
          paymentMethod: paymentMethod,
          totalAmount: Number((grandTotal - deliveryFee).toFixed(2)),
          deliveryCharge: deliveryFee,
          grandTotal: grandTotal,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      console.log("Order created:", orderData);

      if (!orderData.razorpayOrderId) {
        throw new Error("Failed to get Razorpay order ID");
      }

      // Step 2: Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100), // Amount in paise
        currency: "INR",
        name: "Your Store Name",
        description: `Order of ${cartItems.length} items`,
        order_id: orderData.razorpayOrderId,
        handler: (response) => {
          verifyPayment(response, orderData._id);
        },
        prefill: {
          name: selectedAddress.name || "",
          email: selectedAddress.email || "",
          contact: selectedAddress.phone || "",
        },
        notes: {
          address: `${selectedAddress.doorNo || ""} ${selectedAddress.street || ""}, ${selectedAddress.locality || ""}`,
          userId: user._id,
        },
        theme: {
          color: BRAND_COLOR,
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Please try again.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment initialization failed");
      setLoading(false);
      onPaymentError?.(err);
    }
  };

  const verifyPayment = async (response, orderId) => {
    try {
      // Step 3: Verify payment on backend
      const verifyResponse = await fetch("/api/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: orderId,
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log("Verification response:", verifyData);

      if (verifyData.success) {
        setLoading(false);
        onPaymentSuccess?.(verifyData);
      } else {
        throw new Error(verifyData.message || "Payment verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Payment verification failed");
      setLoading(false);
      onPaymentError?.(err);
    }
  };

  // Helper function to calculate delivery fee
  const getDeliveryFee = (amount) => {
    if (amount < 200) return 40;
    if (amount >= 200 && amount < 500) return 30;
    if (amount >= 500 && amount < 1000) return 20;
    return 0;
  };

  const paymentMethods = [
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: CreditCardIcon,
      description: "Visa, MasterCard, RuPay",
    },
    {
      id: "upi",
      label: "UPI",
      icon: PhoneAndroidIcon,
      description: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "netbanking",
      label: "Net Banking",
      icon: AccountBalanceIcon,
      description: "All major banks",
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Payment Method
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose your preferred payment option to complete the order
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
              Total Amount to Pay
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
              Items in Cart
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
          Select Payment Method
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;

            return (
              <Card
                key={method.id}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: isSelected
                    ? `2px solid ${BRAND_COLOR}`
                    : `1px solid ${theme.palette.divider}`,
                  bgcolor: isSelected ? `${BRAND_COLOR}05` : "transparent",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderColor: BRAND_COLOR,
                  },
                }}
                onClick={() => setPaymentMethod(method.id)}
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
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {method.description}
                      </Typography>
                    </Box>
                  </Box>
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
              Your payment is secure
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#2E7D32" }}
            >
              All transactions are protected with SSL encryption and PCI DSS compliance
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || !razorpayLoaded || !grandTotal || grandTotal <= 0}
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
            position: "relative",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} sx={{ color: "#fff" }} />
              Processing...
            </Box>
          ) : (
            `Pay ₹${grandTotal ? grandTotal.toFixed(2) : "0.00"}`
          )}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", px: 1 }}
        >
          By clicking Pay, you agree to complete this purchase. Your payment details are secure and encrypted.
        </Typography>
      </Box>
    </Box>
  );
}