import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useCart } from "../context/CartContext";

export default function OrderSummary({ onNext }) {
  const { cartItems, calculateItemPrice, getTotalPrice } = useCart();

  const totalAmount = Number(getTotalPrice());

  // DELIVERY CHARGE RULES
  const getDeliveryFee = (amount) => {
    if (amount < 200) return 40;
    if (amount >= 200 && amount < 500) return 30;
    if (amount >= 500 && amount < 1000) return 20;
    return 0; // above 1000 = free
  };

  const deliveryFee = getDeliveryFee(totalAmount);
  const grandTotal = totalAmount + deliveryFee;

  const formatWeight = (totalWeight, unit) => {
    if (unit === "piece") return `${totalWeight} pieces`;
    if (unit === "g" && totalWeight >= 1000)
      return `${totalWeight / 1000}kg`;
    return `${totalWeight}${unit}`;
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Order Summary
      </Typography>

      {/* ORDER ITEMS */}
      <Box>
        {cartItems.map((item) => {
          const {
            productSnapshot,
            totalWeight,
            unit,
            quantity,
            _id,
          } = item;

          const itemTotal = calculateItemPrice(item);

          return (
            <Box
              key={_id}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #eee",
              }}
            >
              {/* PRODUCT IMAGE */}
              <Box
                component="img"
                src={
                  productSnapshot.image?.data
                    ? `data:${productSnapshot.image.contentType};base64,${productSnapshot.image.data}`
                    : "https://via.placeholder.com/80"
                }
                alt={productSnapshot.name_en}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />

              {/* PRODUCT DETAILS */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "14px" }}>
                  Product Name: {productSnapshot.name_en}
                </Typography>

                <Typography sx={{ fontSize: "14px" }}>
                  Price: ₹{productSnapshot.price} ×{" "}
                  {productSnapshot.weightValue}
                  {productSnapshot.weightUnit}
                </Typography>
                <Typography
                  sx={{ fontSize: "14px", mt: 0.5, color: "#D31032" }}
                >
                  Weight: {formatWeight(totalWeight, unit)}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    mt: 0.8,
                    fontSize: "15px",
                    color: "#222",
                  }}
                >
                  Total: ₹{itemTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* PRICE DETAILS */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
        Price Details
      </Typography>

      {/* Subtotal */}
      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
        <Typography>Subtotal</Typography>
        <Typography>₹{totalAmount.toFixed(2)}</Typography>
      </Box>

      {/* Delivery Fee */}
      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
        <Typography>Delivery Fee</Typography>
        <Typography>
          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* GRAND TOTAL */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Total Amount
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#D31032" }}>
          ₹{grandTotal.toFixed(2)}
        </Typography>
      </Box>

      {/* CONTINUE BUTTON */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 3,
          backgroundColor: "#D31032",
          py: 1.3,
          fontSize: "1rem",
          fontWeight: 700,
          "&:hover": { backgroundColor: "#b40d2c" },
        }}
        onClick={onNext}
      >
        Continue to Payment
      </Button>
    </Paper>
  );
}
