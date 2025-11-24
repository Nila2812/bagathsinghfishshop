import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Box,
  Drawer,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../components/LanguageContext";

const CategoryProducts = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // 🧩 Filter States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOrder, setSortOrder] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  // 🧭 Fetch category + products (supports /category/:id and /products)
 useEffect(() => {
  const fetchProducts = async () => {
    try {
      let res;
      let categoryData = {};

      // Detect search mode from URL
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get("query");

      if (searchQuery) {
        // 🔍 SEARCH MODE
        res = await axios.get(
          `http://localhost:5000/api/products/search?query=${searchQuery}`
        );
        console.log("🔎 Search Response:", res.data)


        categoryData = {
          name_en: `Search results for "${searchQuery}"`,
          name_ta: `"${searchQuery}" தேடல் முடிவுகள்`,
        };
      } 
      else if (id) {
        // 📂 CATEGORY MODE
        const categoryRes = await axios.get(
          `http://localhost:5000/api/category/${id}`
        );
        categoryData = categoryRes.data;

        res = await axios.get(
          `http://localhost:5000/api/products/by-category/${id}`
        );
         console.log("🔎 Search Response:", res.data)

      } 
      else {
        // 📦 ALL PRODUCTS MODE
        res = await axios.get(`http://localhost:5000/api/products`);

        categoryData = {
          name_en: "All Products",
          name_ta: "அனைத்து பொருட்கள்",
        };
      }

      setCategory(categoryData);

      // 🎯 UNIFIED FORMAT (same for all modes)
      const formatted = res.data.map((p) => ({
        _id: p._id,
        name_en: p.name_en,
        name_ta: p.name_ta,
        price: p.price,
        weight: `${p.weightValue} ${p.weightUnit}`,
        image: p.image
          ? { data: p.image.data, contentType: p.image.contentType }
          : null,
      }));

      setProducts(formatted);
      setFilteredProducts(formatted);
    } catch (err) {
      console.error("❌ Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [id, location.search]);

  // 🛒 Cart Handlers
  const handleAddToCart = (product, add) => {
    if (add) setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    else setCart((prev) => prev.filter((item) => item._id !== product._id));
  };

  const handleUpdateCart = (product, quantity) => {
    setCart((prev) =>
      prev.map((item) => (item._id === product._id ? { ...item, quantity } : item))
    );
  };

  // 🧮 Filter Logic
  const applyFilters = () => {
    let result = [...products];
    const filters = [];

    // Price Filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    filters.push(
      language === "TA"
        ? `விலை: ₹${priceRange[0]}–₹${priceRange[1]}`
        : `Price: ₹${priceRange[0]}–₹${priceRange[1]}`
    );

    // Sort Filter
    if (sortOrder === "asc") {
      result.sort((a, b) => a.price - b.price);
      filters.push(language === "TA" ? "விலை: குறைந்தது முதல்" : "Sort: Low → High");
    }
    if (sortOrder === "desc") {
      result.sort((a, b) => b.price - a.price);
      filters.push(language === "TA" ? "விலை: அதிகம் முதல்" : "Sort: High → Low");
    }

    setFilteredProducts(result);
    setActiveFilters(filters);
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSortOrder("");
    setActiveFilters([]);
    setFilteredProducts(products);
  };

  const removeFilter = (filter) => {
    const updated = activeFilters.filter((f) => f !== filter);
    setActiveFilters(updated);
    //applyFilters();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const categoryDisplayName =
    language === "TA"
      ? category.name_ta || category.name_en
      : category.name_en || category.name_ta;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: `"Poppins", "Lato", sans-serif`,
        backgroundColor: "#fafafa",
      }}
    >
      {/* 🧭 Header */}
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

      {/* 📜 Content */}
      <Box sx={{ mt: { xs: "92px", sm: "108px", md: "110px" }, flexGrow: 1, pb: 6 }}>
        <CategoryBar fixed={false} />

        {/* 🏠 Breadcrumb + Filter */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 4, md: 6 },
            mt: 2,
            borderBottom: "1px solid #e0e0e0",
            pb: 1.5,
          }}
        >
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HomeOutlinedIcon
              sx={{ fontSize: 22, color: "#333", cursor: "pointer", "&:hover": { color: "#be3838" } }}
              onClick={() => navigate("/")}
            />
            <Typography variant="body2" sx={{ color: "#666", fontSize: "0.9rem" }}>
              <span style={{ color: "#333", cursor: "pointer" }} onClick={() => navigate("/")}>
                {language === "TA" ? "முகப்பு" : "Home"}
              </span>{" "}
              /{" "}
              <span style={{ color: "#be3838", textTransform: "capitalize" }}>
                {categoryDisplayName ||
                  (language === "TA" ? "அனைத்து பொருட்கள்" : "All Products")}
              </span>
            </Typography>
          </Box>

          {/* Filter Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              px: 2,
              py: 0.7,
              border: "1px solid #ccc",
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <FilterListIcon sx={{ color: "#333", fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
              {language === "TA" ? "வடிகட்டு" : "Filter"}
            </Typography>
          </Box>
        </Box>

        {/* 🎯 Active Filters */}
        {activeFilters.length > 0 && (
          <Box
            sx={{
              px: { xs: 1.5, sm: 4, md: 6 },
              py: 2,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              borderBottom: "1px solid #eee",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#555" }}>
              {language === "TA" ? "செயலில் உள்ள வடிகட்டிகள்:" : "Active Filters:"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter}
                  onDelete={() => removeFilter(filter)}
                  deleteIcon={<CloseIcon />}
                  sx={{
                    backgroundColor: "#f7dede",
                    color: "#a62f2f",
                    "& .MuiChip-deleteIcon": { color: "#a62f2f" },
                  }}
                />
              ))}
              <Button
                size="small"
                onClick={clearFilters}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  color: "#555",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {language === "TA" ? "அனைத்தையும் நீக்கு" : "Clear All"}
              </Button>
            </Stack>
          </Box>
        )}

        {/* 🛍️ Product Grid */}
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 4, lg: 6 }, py: 4 }}>
          {filteredProducts.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
              {language === "TA"
                ? "இந்த வகையில் பொருட்கள் இல்லை."
                : "No products found for this category."}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                },
                gap: { xs: 1.5, sm: 2, md: 2.5 },
                justifyItems: "center",
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    displayName:
                      language === "TA"
                        ? product.name_ta || product.name_en
                        : product.name_en || product.name_ta,
                  }}
                  onAddToCart={handleAddToCart}
                  onUpdateCart={handleUpdateCart}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Footer />
      {/* 🧩 Filter Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "80%", sm: "60%", md: 320, lg: 360 },
              p: { xs: 2, sm: 3 },
            },
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
          {language === "TA" ? "வடிகட்டல் விருப்பங்கள்" : "Filter Options"}
        </Typography>

        <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
          {language === "TA" ? "விலை வரம்பு (₹)" : "Price Range (₹)"}
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ color: "#be3838" }}
        />

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel id="sort-label">
            {language === "TA" ? "தரவரிசை படி" : "Sort By"}
          </InputLabel>
          <Select
            labelId="sort-label"
            value={sortOrder}
            label={language === "TA" ? "தரவரிசை படி" : "Sort By"}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="">{language === "TA" ? "எதுவுமில்லை" : "None"}</MenuItem>
            <MenuItem value="asc">
              {language === "TA" ? "விலை: குறைந்தது முதல்" : "Price: Low to High"}
            </MenuItem>
            <MenuItem value="desc">
              {language === "TA" ? "விலை: அதிகம் முதல்" : "Price: High to Low"}
            </MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#be3838", "&:hover": { backgroundColor: "#a62f2f" } }}
            onClick={applyFilters}
            fullWidth
          >
            {language === "TA" ? "பயன்படுத்து" : "Apply"}
          </Button>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ borderColor: "#999", color: "#333" }}
            fullWidth
          >
            {language === "TA" ? "அழி" : "Clear"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CategoryProducts;
