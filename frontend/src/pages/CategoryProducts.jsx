import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

// 🧭 Navbar Components
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";

const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");

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
          image: p.image
            ? `data:${p.image.contentType};base64,${p.image.data}`
            : null,
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

  // 🛒 Cart Logic
  const handleAddToCart = (product, add) => {
    if (add) {
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    } else {
      setCart((prev) => prev.filter((item) => item._id !== product._id));
    }
  };

  const handleUpdateCart = (product, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === product._id ? { ...item, quantity } : item
      )
    );
  };

  // 🧮 Price Filter Logic
  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);

  const handleFilterSelect = (label, min, max) => {
    setSelectedFilter(label);
    setAnchorEl(null);

    if (label === "All") {
      setFilteredProducts(products);
    } else if (max) {
      setFilteredProducts(products.filter((p) => p.price >= min && p.price <= max));
    } else {
      // "More than 1000"
      setFilteredProducts(products.filter((p) => p.price > min));
    }
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
      {/* 🧭 Fixed Header */}
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
        <CategoryBar fixed={false} />

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
          {/* Breadcrumb Section */}
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
            <Typography
              variant="body2"
              sx={{ color: "#666", fontSize: "0.9rem" }}
            >
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
              gap: 0.8,
              cursor: "pointer",
              px: 2,
              py: 0.6,
              border: "1px solid #ccc",
              borderRadius: "6px",
              transition: "0.2s",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#999",
              },
            }}
            onClick={handleFilterClick}
          >
            <FilterAltOutlinedIcon sx={{ color: "#333", fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
              Filter
            </Typography>
          </Box>

          {/* 🧮 Filter Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterSelect("All")}>
              All Prices
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect("100-250", 100, 250)}>
              Rs 100 - Rs 250
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect("251-600", 251, 600)}>
              Rs 251 - Rs 600
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect("601-1000", 601, 1000)}>
              Rs 601 - Rs 1000
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect(">1000", 1000, null)}>
              More than Rs 1000
            </MenuItem>
          </Menu>
        </Box>

        {/* 🛍️ Product Grid */}
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 4, lg: 6 }, py: 4 }}>
          {filteredProducts.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
              No products found for this price range.
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
                alignItems: "start",
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

      <Footer />
    </Box>
  );
};

export default CategoryProducts;
