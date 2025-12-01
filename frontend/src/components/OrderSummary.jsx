import React, { useEffect } from "react";
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
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useCart } from "../context/CartContext";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";

const BRAND_COLOR = "#D31032";

export default function OrderSummary({ onNext, onGrandTotalChange }) {
  const { cartItems, calculateItemPrice, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { language } = useLanguage();
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

  // Pass grand total to parent whenever it changes
  useEffect(() => {
    if (onGrandTotalChange) {
      onGrandTotalChange(grandTotal);
    }
  }, [grandTotal, onGrandTotalChange]);

  // Calculate savings message
  const getSavingsMessage = () => {
  if (language === "TA") {
    if (totalAmount < 200) return `₹${(200 - totalAmount).toFixed(0)} கூட சேர்த்தால் டெலிவரி ₹10 குறையும்`;
    if (totalAmount < 500) return `₹${(500 - totalAmount).toFixed(0)} கூட சேர்த்தால் டெலிவரி ₹10 குறையும்`;
    if (totalAmount < 1000) return `₹${(1000 - totalAmount).toFixed(0)} கூட சேர்த்தால் இலவச டெலிவரி`;
    return "🎉 வாழ்த்துக்கள்! நீங்கள் இலவச டெலிவரியை பெற்றுள்ளீர்கள்";
  }

  // English
  if (totalAmount < 200) return `Add ₹${(200 - totalAmount).toFixed(0)} more to save ₹10 on delivery`;
  if (totalAmount < 500) return `Add ₹${(500 - totalAmount).toFixed(0)} more to save ₹10 on delivery`;
  if (totalAmount < 1000) return `Add ₹${(1000 - totalAmount).toFixed(0)} more for FREE delivery`;
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
           {language === "TA" ? "ஆர்டர் விவரம்" : "Order Summary"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
         {language === "TA" ? "தொடருவதற்கு முன் உங்கள் ஆர்டரை சரிபார்க்கவும்" : "Review your order details before proceeding"}
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
            {getSavingsMessage()}
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
             {language === "TA"
              ? `பொருட்கள் (${cartItems.length})`
              : `Items (${cartItems.length})`}
          </Typography>
          <Chip 
            label={ language === "TA"
                ? `${cartItems.length} பொருள்`
                : `${cartItems.length} ${cartItems.length === 1 ? "item" : "items"}`} 
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
                    alt={language === "EN" ? productSnapshot.name_en : productSnapshot.name_ta}
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
                      {language === "TA" ? "பொருள் பெயர்:" : "Product Name:"}{' '}
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{ 
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                 {language === "EN" ? productSnapshot.name_en : productSnapshot.name_ta}
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
                        {language === "TA" ? "விலை:" : "Price:"}{' '}
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
                        {language === "TA" ? "எடை:" : "Weight:"}{' '}
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
                       {language === "TA" ? "மொத்தம்:" : "Total:"} ₹{itemTotal.toFixed(2)}
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
          {language === "TA" ? "விலை விவரம்" : "Price Breakdown"}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Subtotal */}
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
           {language === "TA"
          ? `கூட்டு மொத்தம் (${cartItems.length} பொருள்)`
          : `Subtotal (${cartItems.length} ${cartItems.length === 1 ? "item" : "items"})`}

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
             {language === "TA" ? "டெலிவரி கட்டணம்" : "Delivery Fee"}
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
           {deliveryFee === 0 ? (language === "TA" ? "இலவசம்" : "FREE") : `₹${deliveryFee}`}
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
            {language === "TA" ? "மொத்த தொகை" : "Total Amount"}
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
          {language === "TA"
          ? "*பொருத்தமான வரிகள் எல்லாம் இதில் அடங்கும்"
          : "*All prices are inclusive of applicable taxes"}
        </Typography>
      </Paper>

      {/* 🔥 ACTION BUTTONS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 🔥 NEW: Shop More Button */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ShoppingBagIcon />}
          sx={{
            color: BRAND_COLOR,
            borderColor: BRAND_COLOR,
            py: 1.5,
            fontSize: { xs: "15px", sm: "16px" },
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            "&:hover": { 
              borderColor: BRAND_COLOR,
              backgroundColor: `${BRAND_COLOR}10`,
            },
          }}
          onClick={() => navigate("/products")}
        >
          Shop More Products
        </Button>
        
        {/* Continue to Payment Button */}
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
          {language === "TA" ? "கட்டணத்திற்கு தொடரவும்" : "Continue to Payment"}
        </Button>
      </Box>

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
          {language === "TA"
          ? "SSL பாதுகாப்புடன் பாதுகாக்கப்பட்ட பரிவர்த்தனை"
          : "Secure checkout powered by SSL encryption"}

        </Typography>
      </Box>
    </Box>
  );
}