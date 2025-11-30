import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import axios from "axios";

const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const ProductCard = ({ product }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const {
    addToCart,
    incrementWeight,
    decrementWeight,
    getProductWeight,
    isInCart,
    getCartItemId,
    loading,
  } = useCart();

  const [offer, setOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(true);

  const inCart = isInCart(product._id);
  const weightDisplay = getProductWeight(product._id);
  const cartItemId = getCartItemId(product._id);
  
  const [stockWarning, setStockWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("Maximum stock limit reached!");

  // Fetch offer for this product
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setOfferLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/offers/by-product/${product._id}`
        );
        
        // Only set offer if it's active and has data
        if (response.data && response.data._id && response.data.isActive) {
          setOffer(response.data);
        } else {
          setOffer(null);
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
        setOffer(null);
      } finally {
        setOfferLoading(false);
      }
    };

    fetchOffer();
  }, [product._id]);

  // Check if product has an active offer
  const hasOffer = offer && offer.isActive;
  const hasDifferentPrices = hasOffer && offer.costPrice !== offer.sellingPrice;
  const showDiscountBadge = hasOffer && offer.discountPercent > 0 && hasDifferentPrices;
  
  // Determine which price to display
  const displayPrice = hasOffer ? offer.sellingPrice : product.price;
  const originalPrice = hasOffer ? offer.costPrice : null;

  if ((loading || offerLoading) && !inCart) {
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
      
      if (result && result.capped) {
        setWarningMessage(`Maximum stock reached! Capped at ${result.cartItem.totalWeight} ${result.cartItem.unit}`);
        setStockWarning(true);
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

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

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
          position: "relative",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 6px 14px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Discount Badge - Only show if there's actual discount and different prices */}
        {showDiscountBadge && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#ff5722",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.65rem",
              px: 1,
              py: 0.5,
              borderRadius: "4px",
              zIndex: 1,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {offer.discountPercent}% OFF
          </Box>
        )}

        <CardMedia
          component="img"
          image={productImage}
          alt={language === "EN" ? product.name_en : product.name_ta}
          onClick={handleCardClick}
          sx={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            borderRadius: 1,
            cursor: "pointer",
          }}
        />

        <CardContent sx={{ p: 1 }}>
          <Typography
            variant="subtitle2"
            onClick={handleCardClick}
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
              cursor: "pointer",
              "&:hover": {
                color: "#e23a3a",
              },
            }}
          >
            {language === "EN" ? product.name_en : product.name_ta}
          </Typography>

          {/* Price Display */}
          <Box sx={{ mt: 0.5 }}>
            {/* Case 1: Has offer with different prices - show strikethrough + new price */}
            {hasDifferentPrices ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    fontFamily: language === "EN" ? englishFont : tamilFont,
                  }}
                >
                  {`${product.weight}`}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      color: "text.secondary",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{originalPrice}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: "bold",
                      color: "#ff5722",
                    }}
                  >
                    ₹{displayPrice}
                  </Typography>
                </Box>
              </>
            ) : (
              /* Case 2: No offer OR same prices - show single price */
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  fontFamily: language === "EN" ? englishFont : tamilFont,
                }}
              >
                {`${product.weight}`} | ₹{displayPrice}
              </Typography>
            )}
          </Box>

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