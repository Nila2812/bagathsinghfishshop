import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

// 🧭 Navbar Components
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // 🧩 Filter States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOrder, setSortOrder] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  // 🧭 Fetch category and products
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryRes = await axios.get(`http://localhost:5000/api/category/${id}`);
        setCategoryName(categoryRes.data.name_en || categoryRes.data.name);

        const res = await axios.get(`http://localhost:5000/api/products/by-category/${id}`);
        const formatted = res.data.map((p) => ({
          _id: p._id,
          name: p.name_en,
          price: p.price,
          weight: `${p.weightValue} ${p.weightUnit}`,
          image: p.image ? `data:${p.image.contentType};base64,${p.image.data}` : null,
        }));
        setProducts(formatted);
        setFilteredProducts(formatted);
      } catch (err) {
        console.error("Failed to fetch products or category:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [id]);

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

    // Filter by price
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    filters.push(`Price: ₹${priceRange[0]}–₹${priceRange[1]}`);

    // Sort
    if (sortOrder === "asc") {
      result.sort((a, b) => a.price - b.price);
      filters.push("Sort: Low → High");
    }
    if (sortOrder === "desc") {
      result.sort((a, b) => b.price - a.price);
      filters.push("Sort: High → Low");
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
    const updatedFilters = activeFilters.filter((f) => f !== filter);
    setActiveFilters(updatedFilters);

    // Reset price or sort depending on what was removed
    if (filter.includes("Price")) setPriceRange([0, 1000]);
    if (filter.includes("Sort")) setSortOrder("");
    applyFilters();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
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

      {/* 📜 Scrollable Content */}
      <Box
        sx={{
          mt: { xs: "160px", md: "110px" },
          flexGrow: 1,
          pb: 6,
        }}
      >
        <Box sx={{ zIndex: 1 }}>
          <CategoryBar fixed={false} />
        </Box>

        {/* 🏠 Breadcrumb + Filter Row */}
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
              sx={{
                fontSize: 22,
                color: "#333",
                cursor: "pointer",
                "&:hover": { color: "#be3838" },
              }}
              onClick={() => (window.location.href = "/")}
            />
            <Typography variant="body2" sx={{ color: "#666", fontSize: "0.9rem" }}>
              <span
                style={{ color: "#333", cursor: "pointer" }}
                onClick={() => (window.location.href = "/")}
              >
                Home
              </span>{" "}
              /{" "}
              <span
                style={{
                  color: "#be3838",
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
                onClick={() => (window.location.href = `/category/${id}`)}
              >
                {categoryName || "Category"}
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
              transition: "0.2s",
              "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#999" },
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <FilterListIcon sx={{ color: "#333", fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
              Filter
            </Typography>
          </Box>
        </Box>

        {/* 🎯 Active Filters */}
        {activeFilters.length > 0 && (
          <Box
            sx={{
              px: { xs: 2, sm: 4, md: 6 },
              py: 2,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              borderBottom: "1px solid #eee",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#555" }}>
              Active Filters:
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
                  ml: 1,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Clear All
              </Button>
            </Stack>
          </Box>
        )}

        {/* 🛍️ Product Grid */}
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 4, lg: 6 }, py: 4 }}>
          {filteredProducts.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
              No products found for this category.
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
                  product={product}
                  onAddToCart={handleAddToCart}
                  onUpdateCart={handleUpdateCart}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* 🦶 Footer */}
      <Footer />

      {/* 🧩 Filter Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "85%", sm: 350 }, p: 3 },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
          Filter Options
        </Typography>

        {/* Price Range */}
        <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
          Price Range (₹)
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ color: "#be3838" }}
        />

        {/* Sort By */}
        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOrder}
            label="Sort By"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="asc">Price: Low to High</MenuItem>
            <MenuItem value="desc">Price: High to Low</MenuItem>
          </Select>
        </FormControl>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#be3838",
              "&:hover": { backgroundColor: "#a62f2f" },
            }}
            onClick={applyFilters}
            fullWidth
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ borderColor: "#999", color: "#333" }}
            fullWidth
          >
            Clear
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CategoryProducts;
