import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../components/LanguageContext";


const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const ProductDescription = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    addToCart,
    addSpecificWeight,
    removeSpecificWeight,
    incrementWeight,
    decrementWeight,
    calculateItemPrice ,
    isInCart,
    getCartItemId,
    cartItems,
  } = useCart();
  
  const handleIncrementSingle = async () => {
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

  const handleDecrementSingle = async () => {
    try {
      await decrementWeight(cartItemId);
    } catch (err) {
      console.error("Failed to decrement:", err);
    }
  };


const fallbackDescription =
  language === "EN"
    ? "This is a high-quality product selected for freshness and great value. Perfect for everyday use and ideal for your household needs."
    : "இது உயர்தரமான, تازا தன்மையும் சிறந்த மதிப்புமுடைய தயாரிப்பு. உங்கள் தினசரி பயன்பாட்டிற்கும் குடும்ப தேவைகளுக்குமான சிறந்த தேர்வு.";

  const [product, setProduct] = useState(null);
  const [offer, setOffer] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockWarning, setStockWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const inCart = product ? isInCart(product._id) : false;
  const cartItemId = product ? getCartItemId(product._id) : null;
  const cartItem = cartItems.find((item) => item._id === cartItemId);
  const totalWeight = cartItem ? cartItem.totalWeight : 0;
  const unit = cartItem ? cartItem.unit : "";

 useEffect(() => {
  fetchProductDetails();
}, [productId]);

const fetchProductDetails = async () => {
  try {
    setLoading(true);

    // Fetch product details and offer simultaneously
    const [productRes, offerRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/products/${productId}`),
      axios.get(`http://localhost:5000/api/offers/by-product/${productId}`),
    ]);

    const prod = productRes.data;
    console.log("🔥 Product data:", prod);
    console.log("🔥 Category ID:", prod.categoryId);
    setProduct(prod);

    // Set offer if available
    if (offerRes.data && offerRes.data._id && offerRes.data.isActive) {
      setOffer(offerRes.data);
    }

    // ---------------------------
    // 🔥 Fetch similar products from CATEGORY
    // ---------------------------
    try {
      if (prod.categoryId?._id) {
        console.log("🔍 Fetching similar products for category:", prod.categoryId._id);
        const similarRes = await axios.get(
          `http://localhost:5000/api/products/by-category/${prod.categoryId._id}`
        );

        console.log("📦 Similar products raw response:", similarRes.data);

        // ✅ FORMAT THE DATA - Same as CategoryProducts page!
        const formatted = similarRes.data
          .filter((p) => p._id !== productId)
          .slice(0, 4)
          .map((p) => ({
            _id: p._id,
            name_en: p.name_en,
            name_ta: p.name_ta,
            price: p.price,
            weight: `${p.weightValue} ${p.weightUnit}`, // 🔥 COMBINED WEIGHT
            weightValue: p.weightValue,
            weightUnit: p.weightUnit,
            baseUnit: p.baseUnit,
            stockQty: p.stockQty,
            categoryId: p.categoryId,
            image: p.image
              ? { data: p.image.data, contentType: p.image.contentType }
              : null,
          }));

        console.log("✅ Formatted similar products:", formatted);
        setSimilarProducts(formatted);
      } else {
        console.log("⚠️ No categoryId found");
        setSimilarProducts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching similar products:", err);
      setSimilarProducts([]);
    }

    setLoading(false);
  } catch (err) {
    console.error("Error fetching product details:", err);
    setError("Failed to load product details");
    setLoading(false);
  }
};

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product._id);
      if (result.error === "OUT_OF_STOCK") {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      } else {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (err) {
      if (err.response?.data?.error === "OUT_OF_STOCK") {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      }
    }
  };

  const handleAddWeight = async (value, unit) => {
    try {
      const stockQty = product.stockQty || 0;
      const result = await addSpecificWeight(cartItemId, value, unit, stockQty);
      if (result?.capped) {
        setWarningMessage("Maximum stock reached! Capped at max quantity");
        setStockWarning(true);
      }
    } catch (err) {
      if (err.response?.data?.error === "OUT_OF_STOCK") {
        setWarningMessage("Maximum stock limit reached!");
        setStockWarning(true);
      }
    }
  };

  const handleRemoveWeight = async (value, unit) => {
    try {
      await removeSpecificWeight(cartItemId, value, unit);
    } catch (err) {
      console.error("Failed to remove weight:", err);
    }
  };

  const getButtons = (baseUnit) => {
    if (baseUnit === "piece") {
      return [
        { label: "1p", value: 1, unit: "piece" },
        { label: "5p", value: 5, unit: "piece" },
        { label: "10p", value: 10, unit: "piece" },
      ];
    } else if (baseUnit === "250g") {
      return [
        { label: "250g", value: 250, unit: "g" },
        { label: "1kg", value: 1000, unit: "g" },
        { label: "5kg", value: 5000, unit: "g" },
      ];
    } else if (baseUnit === "500g") {
      return [
        { label: "500g", value: 500, unit: "g" },
        { label: "1kg", value: 1000, unit: "g" },
        { label: "5kg", value: 5000, unit: "g" },
      ];
    } else if (baseUnit === "1kg") {
      return [
        { label: "1kg", value: 1000, unit: "g" },
        { label: "5kg", value: 5000, unit: "g" },
        { label: "10kg", value: 10000, unit: "g" },
      ];
    }
    return [];
  };

  const formatWeight = (totalWeight, unit) => {
    if (unit === "piece") {
      return `${totalWeight} ${totalWeight === 1 ? "piece" : "pieces"}`;
    } else if (unit === "kg") {
      return `${totalWeight}kg`;
    } else if (unit === "g") {
      if (totalWeight >= 1000) {
        return `${totalWeight / 1000}kg`;
      }
      return `${totalWeight}g`;
    }
    return `${totalWeight}${unit}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error || "Product not found"}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const hasOffer = offer && offer.isActive;
  const hasDifferentPrices =
    hasOffer && offer.costPrice !== offer.sellingPrice;
  const showDiscountBadge =
    hasOffer && offer.discountPercent > 0 && hasDifferentPrices;
  const displayPrice = hasOffer ? offer.sellingPrice : product.price;
  const originalPrice = hasOffer ? offer.costPrice : null;

  const productImage = product.image
    ? `data:${product.image.contentType};base64,${product.image.data}`
    : "../img/placeholder.jpg";

  const productName = language === "EN" ? product.name_en : product.name_ta;
  const productDescription =
    language === "EN" ? product.description_en : product.description_ta;
     const categoryName =
    language === "EN"
      ? product.categoryId?.name_en || "Category"
      : product.categoryId?.name_ta || "வகை";

  const buttons = getButtons(product.baseUnit);

  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh", pb: 4 }}>
      {/* Fixed Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Topbar />
        <MainNavbar fixed />
      </Box>

      <Box sx={{ mt: { xs: "92px", sm: "108px", md: "110px" }, }}>
        <CategoryBar fixed={false}  />

        {/* Breadcrumbs */}
        <Box
          sx={{
            backgroundColor: "white",
            py: 1,
            px: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => navigate(-1)}
                size="small"
                sx={{
                  color: "#e23a3a",
                  "&:hover": { backgroundColor: "#fff5f5" },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              <Breadcrumbs separator="›">
                <Link
                  underline="hover"
                  sx={{
                    cursor: "pointer",
                    color: "#333",
                    fontSize: "0.9rem",
                    "&:hover": { color: "#be3838" }
                  }}
                  onClick={() => navigate("/")}
                >
                  {language === "EN" ? "Home" : "முகப்பு"}
                </Link>

                <Link
                  underline="hover"
                  sx={{
                    cursor: "pointer",
                    color: "#333",
                    fontSize: "0.9rem",
                    "&:hover": { color: "#be3838" }
                  }}
                  onClick={() => navigate("/products")}
                >
                  {language === "EN" ? "Products" : "தயாரிப்புகள்"}
                </Link>

                <Typography
                  sx={{
                    color: "#be3838",
                    fontSize: "0.9rem",
                    textTransform: "capitalize"
                  }}
                >
                  {productName}
                </Typography>
              </Breadcrumbs>

            </Box>
          </Box>
        </Box>

        {/* Main Section */}
        <Box sx={{ maxWidth: "1400px", mx: "auto", px: 3, mt: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" },
              gap: 4,
              backgroundColor: "white",
              borderRadius: 2,
              p: 4,
              boxShadow: "0 2px 8px rgba(252, 73, 73, 0.1)",
            }}
          >
            {/* IMAGE */}
            <Box>
             <Box
              sx={{
                width: "100%",
                paddingTop: "100%",
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
                transition: "transform 0.4s ease",
                "&:hover img": { transform: "scale(1.05)" },
              }}
            >
                {showDiscountBadge && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      backgroundColor: "#ff5722",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "4px",
                      zIndex: 1,
                    }}
                  >
                    {offer.discountPercent}% OFF
                  </Box>
                )}

                <Box
                  component="img"
                  src={productImage}
                  alt={productName}
                  sx={{
                    textTransform: "capitalize",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />
              </Box>
            </Box>

            {/* DETAILS */}
            <Box>
              <Box sx={{display: "flex", flexDirection: "row", gap:2, alignItems: "center"}}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 , textTransform: "capitalize", 
                 color: "#be3838", }}>
                {productName}
              </Typography>

              <Typography variant="body1" sx={{ color: "#535252ff", mb: 2, textTransform: "capitalize" }}>
                ({categoryName})
              </Typography>
                </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                {productDescription && productDescription.trim() !== ""
                  ? productDescription
                  : fallbackDescription}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* PRICE */}
              <Box sx={{ mb: 3 }}>
                {hasDifferentPrices ? (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {language === "EN" ? "Weight: " : "எடை: "} {product.weightValue} {product.weightUnit}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Typography
                        sx={{
                          textDecoration: "line-through",
                          fontSize: "1.1rem",
                          color: "text.secondary",
                        }}
                      >
                        ₹{originalPrice}
                      </Typography>

                      <Typography
                        sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#ff5722" }}
                      >
                        ₹{displayPrice}
                      </Typography>
                    </Box>

                    <Typography sx={{ color: "#2e7d32", fontWeight: 600 }}>
                      {language === "EN" ? "You Save" : "நீங்கள் சேமித்தது"}: ₹
                      {originalPrice - displayPrice}
                    </Typography>
                  </>
                ) : (
                  <>

                    <Typography sx={{ fontSize: "1rem", fontWeight: 550 }}>
                    ₹{displayPrice} / {product.weightValue} {product.weightUnit} 
                    </Typography>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ADD TO CART */}
              {!inCart ? (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  sx={{ py: 1.5, backgroundColor: "#e23a3a" }}
                >
                  {language === "EN" ? "Add to Cart" : "கூடையில் சேர்க்கவும்"}
                </Button>
              ) : (
                <Box>
                  {/* Current Quantity */}
                  <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          backgroundColor: "#f8f8f8",
                          border: "1px solid #c6392fff",
                          borderColor: "#c6392fff",
                            boxShadow: "0 0 2px #f44336",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "0.5s",
                        }}
                      >
                        <Typography fontWeight={600}>
                          {language === "EN" ? "Current Quantity:" : "தற்போதைய அளவு:"}
                        </Typography>

                        {/* + / - quantity box */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: "1px solid #ccc",
                            px: 1.5,
                            py: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{ color: "#e23a3a" }}
                            onClick={handleDecrementSingle}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>

                          <Typography fontWeight={700}>
                            {formatWeight(totalWeight, unit)}
                          </Typography>

                          <IconButton
                            size="small"
                            sx={{ color: "#2e7d32" }}
                            onClick={handleIncrementSingle}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Total Price */}
                        <Typography fontWeight={700} sx={{ color: "#be3838" }}>
                        Total price: ₹{cartItem ? calculateItemPrice(cartItem).toFixed(2) : displayPrice}
                        </Typography>
                      </Box>


                  {/* Increase */}
                  <Box sx={{ mb: 2 }}>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Typography fontWeight={600} mb={1}>
                      {language === "EN"
                        ? "Increase quantity →"
                        : "அளவு அதிகரிக்க →"}
                    </Typography>
                      {buttons.map((btn, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          sx={{ backgroundColor: "#4caf50" }}
                          size="small"
                          onClick={() => handleAddWeight(btn.value, btn.unit)}
                        >
                          +{btn.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Decrease */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                       <Typography fontWeight={600} mb={1}>
                      {language === "EN"
                        ? "Decrease quantity →"
                        : "அளவு குறைக்க →"}
                    </Typography>
                      {buttons.map((btn, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          sx={{ backgroundColor: "#f44336" }}
                          size="small"
                          onClick={() => handleRemoveWeight(btn.value, btn.unit)}
                        >
                          -{btn.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* View Cart */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent("openCart"))
                    }
                    sx={{ py: 1.5, backgroundColor: "#1a1a1a" }}
                  >
                    {language === "EN" ? "View Cart" : "கூடையைப் பார்க்கவும்"}
                  </Button>
                </Box>
              )}

              {/* Offer */}
              {hasOffer && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography fontWeight={600}>
                    {language === "EN"
                      ? offer.title_en
                      : offer.title_ta || "சிறப்பு சலுகை"}
                  </Typography>
                  {(offer.description_en || offer.description_ta) && (
                    <Typography>
                      {language === "EN"
                        ? offer.description_en
                        : offer.description_ta}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          </Box>

          {/* SIMILAR PRODUCTS */}

                      {similarProducts && similarProducts.length > 0 && (
                        <Box sx={{ mt: 6, maxWidth: "1400px", mx: "auto", px: 2 }}>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            mb={3}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {language === "EN" ? "Similar Products" : "ஒத்த தயாரிப்புகள்"}
                          </Typography>

                          <Grid container spacing={3}>
                            {similarProducts.map((item) => (
                              <Grid item xs={12} sm={6} md={3} key={item._id}>
                                <ProductCard product={item} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Optional fallback if no similar products */}
                      {similarProducts && similarProducts.length === 0 && (
                        <Box sx={{ mt: 4, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            {language === "EN"
                              ? "No similar products found."
                              : "ஒத்த தயாரிப்புகள் இல்லை."}
                          </Typography>
                        </Box>
                      )}

        </Box>
      </Box>

      {/* Snackbars */}
      <Snackbar
        open={stockWarning}
        autoHideDuration={3000}
        onClose={() => setStockWarning(false)}
      >
        <Alert severity="warning">{warningMessage}</Alert>
      </Snackbar>

      <Snackbar
        open={addedToCart}
        autoHideDuration={2000}
        onClose={() => setAddedToCart(false)}
      >
        <Alert severity="success">
          {language === "EN"
            ? "Added to cart successfully!"
            : "கூடையில் வெற்றிகரமாக சேர்க்கப்பட்டது!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDescription;