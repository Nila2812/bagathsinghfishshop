import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Card,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useCart } from "../context/CartContext";

const BRAND_COLOR = "#D31032";

export default function OrderSummary({ onNext }) {
  const { cartItems, calculateItemPrice, getTotalPrice } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Calculate savings message
  const getSavingsMessage = () => {
    if (totalAmount < 200) {
      return `Add ₹${(200 - totalAmount).toFixed(0)} more to save ₹10 on delivery`;
    }
    if (totalAmount >= 200 && totalAmount < 500) {
      return `Add ₹${(500 - totalAmount).toFixed(0)} more to save ₹10 on delivery`;
    }
    if (totalAmount >= 500 && totalAmount < 1000) {
      return `Add ₹${(1000 - totalAmount).toFixed(0)} more for FREE delivery`;
    }
    return "You're getting FREE delivery! 🎉";
  };

  const formatWeight = (totalWeight, unit) => {
    if (unit === "piece") return `${totalWeight} pieces`;
    if (unit === "g" && totalWeight >= 1000)
      return `${totalWeight / 1000}kg`;
    return `${totalWeight}${unit}`;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 0.5 }}
        >
          Order Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review your order details before proceeding
        </Typography>
      </Box>

      {/* Delivery Savings Banner */}
      {totalAmount < 1000 && (
        <Card
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "#FFF9E6",
            border: "1px solid #FFE082",
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <LocalShippingOutlinedIcon sx={{ color: "#F57C00", fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: "#E65100", fontSize: '13px' }}>
            {getSavingsMessage()}
          </Typography>
        </Card>
      )}

      {deliveryFee === 0 && totalAmount >= 1000 && (
        <Card
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "#E8F5E9",
            border: "1px solid #81C784",
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <LocalShippingOutlinedIcon sx={{ color: "#2E7D32", fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1B5E20", fontSize: '13px' }}>
            🎉 Congratulations! You've unlocked FREE delivery
          </Typography>
        </Card>
      )}

      {/* ORDER ITEMS */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px' }}>
            Items ({cartItems.length})
          </Typography>
          <Chip 
            label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`} 
            size="small" 
            sx={{ 
              bgcolor: `${BRAND_COLOR}10`,
              color: BRAND_COLOR,
              fontWeight: 600,
              height: 24,
              fontSize: '12px',
            }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box>
          {cartItems.map((item, index) => {
            const {
              productSnapshot,
              totalWeight,
              unit,
              _id,
            } = item;

            const itemTotal = calculateItemPrice(item);

            return (
              <Box key={_id}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 1.5,
                  }}
                >
                  {/* PRODUCT IMAGE */}
                  <Box
                    component="img"
                    src={
                      productSnapshot.image?.data
                        ? `data:${productSnapshot.image.contentType};base64,${productSnapshot.image.data}`
                        : "https://via.placeholder.com/70"
                    }
                    alt={productSnapshot.name_en}
                    sx={{
                      width: { xs: 65, sm: 70 },
                      height: { xs: 65, sm: 70 },
                      objectFit: "cover",
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      flexShrink: 0,
                    }}
                  />

                  {/* PRODUCT DETAILS */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '12px',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        Product Name:{' '}
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {productSnapshot.name_en}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '12px',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        Price:{' '}
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        ₹{productSnapshot.price} × {productSnapshot.weightValue}{productSnapshot.weightUnit}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '12px',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        Weight:{' '}
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                          color: BRAND_COLOR,
                        }}
                      >
                        {formatWeight(totalWeight, unit)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '15px',
                          color: BRAND_COLOR,
                        }}
                      >
                        Total: ₹{itemTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < cartItems.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* PRICE BREAKDOWN */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontSize: '15px' }}>
          Price Breakdown
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Subtotal */}
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
            Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
            ₹{totalAmount.toFixed(2)}
          </Typography>
        </Box>

        {/* Delivery Fee */}
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              Delivery Fee
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              fontSize: '13px',
              color: deliveryFee === 0 ? '#2E7D32' : 'text.primary'
            }}
          >
            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* GRAND TOTAL */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            bgcolor: `${BRAND_COLOR}05`,
            p: 1.5,
            borderRadius: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
            Total Amount
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLOR, fontSize: '16px' }}>
            ₹{grandTotal.toFixed(2)}
          </Typography>
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 1.5, textAlign: 'center', fontSize: '11px' }}
        >
          *All prices are inclusive of applicable taxes
        </Typography>
      </Paper>

      {/* CONTINUE BUTTON */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: BRAND_COLOR,
          py: 1.5,
          fontSize: { xs: "15px", sm: "16px" },
          fontWeight: 700,
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: `0 4px 12px ${BRAND_COLOR}40`,
          "&:hover": { 
            backgroundColor: "#b40d2c",
            boxShadow: `0 6px 16px ${BRAND_COLOR}50`,
          },
        }}
        onClick={onNext}
      >
        Continue to Payment
      </Button>

      {/* Security Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <Box 
          sx={{ 
            width: 4, 
            height: 4, 
            borderRadius: '50%', 
            bgcolor: '#4CAF50' 
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
          Secure checkout powered by SSL encryption
        </Typography>
      </Box>
    </Box>
  );
}