import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "../context/CartContext";
import { useLanguage } from "./LanguageContext";

const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const ProductCard = ({ product }) => {
  const { language } = useLanguage();
  const {
    addToCart,
    incrementWeight,
    decrementWeight,
    getProductWeight,
    isInCart,
    getCartItemId,
    loading,
  } = useCart();

  const inCart = isInCart(product._id);
  const weightDisplay = getProductWeight(product._id);
  const cartItemId = getCartItemId(product._id);
  
  // 🔥 FIX: Add missing state declarations
  const [stockWarning, setStockWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("Maximum stock limit reached!");

  if (loading && !inCart) {
    return (
      <Card
        sx={{
          width: "100%",
          maxWidth: 180,
          borderRadius: 2,
          boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          p: 0.5,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: 280,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Card>
    );
  }

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product._id);
      if (result.error === 'OUT_OF_STOCK') {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      }
    } catch (err) {
      if (err.response?.data?.error === 'OUT_OF_STOCK') {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      }
    }
  };

  const handleIncrement = async () => {
    try {
      const result = await incrementWeight(cartItemId);
      
      // 🔥 Check if capped and show warning, but ALLOW the increment
      if (result && result.capped) {
        setWarningMessage(`Maximum stock reached! Capped at ${result.cartItem.totalWeight} ${result.cartItem.unit}`);
        setStockWarning(true);
        // ✅ Weight still updates because state was updated in CartContext
      }
    } catch (err) {
      if (err.response?.data?.error === 'OUT_OF_STOCK') {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      } else {
        console.error("Failed to increment:", err);
      }
    }
  };

  const handleDecrement = async () => {
    try {
      await decrementWeight(cartItemId);
    } catch (err) {
      console.error("Failed to decrement:", err);
    }
  };

  const productImage = product.image
    ? `data:${product.image.contentType};base64,${product.image.data}`
    : "../img/placeholder.jpg";

  return (
    <>
      <Card
        sx={{
          width: "100%",
          maxWidth: 180,
          borderRadius: 2,
          boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          px: { xs: 0.5, sm: 0.8, md: 1 },
          py: { xs: 0.5, sm: 0.8, md: 1 },
          m: 0.1,
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 6px 14px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardMedia
          component="img"
          image={productImage}
          alt={language === "EN" ? product.name_en : product.name_ta}
          sx={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            borderRadius: 1,
          }}
        />

        <CardContent sx={{ p: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: "black",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.8em",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              fontFamily: language === "EN" ? englishFont : tamilFont,
            }}
          >
            {language === "EN" ? product.name_en : product.name_ta}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              fontFamily: language === "EN" ? englishFont : tamilFont,
            }}
          >
            {`${product.weight}`} | ₹{product.price}
          </Typography>

          {!inCart ? (
            <Button
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                mt: 1,
                backgroundColor: "#e23a3a",
                textTransform: "none",
                fontSize: "0.75rem",
                py: 0.5,
                "&:hover": { backgroundColor: "#cc3232" },
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 1,
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={handleDecrement}
                  sx={{
                    backgroundColor: "#f44336",
                    color: "white",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      backgroundColor: "#e53935",
                    },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: "1rem" }} />
                </IconButton>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#e23a3a",
                    fontSize: "0.85rem",
                    minWidth: "50px",
                    textAlign: "center",
                  }}
                >
                  {weightDisplay}
                </Typography>

                <IconButton
                  size="small"
                  onClick={handleIncrement}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    width: 28,
                    height: 28,
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Box>

              <Button
                size="small"
                onClick={() => window.dispatchEvent(new CustomEvent('openCart'))}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  fontSize: "0.65rem",
                  textTransform: "none",
                  borderColor: "#e23a3a",
                  color: "#e23a3a",
                  py: 0.3,
                  px: 1,
                }}
              >
                Cart
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 🔥 Snackbar with auto-hide */}
      <Snackbar
        open={stockWarning}
        autoHideDuration={3000}
        onClose={() => setStockWarning(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setStockWarning(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;