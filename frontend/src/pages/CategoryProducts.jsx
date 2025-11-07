import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Typography, Box } from "@mui/material";
import ProductCard from "../components/ProductCard";
import axios from "axios";

// 🧭 Navbar Components
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";

const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(""); // ✅ new state
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // 🧩 Fetch the category name
        const categoryRes = await axios.get(`http://localhost:5000/api/category/${id}`);
        setCategoryName(categoryRes.data.name_en || categoryRes.data.name);

        // 🛍️ Fetch products in that category
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
      } catch (err) {
        console.error("Failed to fetch products or category:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [id]);

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
      {/* 🧭 Fixed Header (Topbar + MainNavbar) */}
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
        {/* 👇 Category Bar */}
        <Box sx={{ zIndex: 1 }}>
          <CategoryBar fixed={false} />
        </Box>

        {/* 🏷️ Category Title Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 4, md: 6 },
            mt: 2,
           
          }}
        >
          {/* 🏠 Home Navigation Link */}
          <Typography
            variant="body1"
            sx={{
              color: "#e23a3a",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => (window.location.href = "/")}
          >
            ← Home
          </Typography>

          {/* 🏷️ Category Name (Centered) */}
          <Typography
            variant="h4"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: "bold",
              textTransform: "capitalize",
              color: "#be3838ff",
              
            }}
          >
            {categoryName || "Category"}
          </Typography>

          {/* Empty spacer to balance layout */}
          <Box sx={{ width: "70px" }} />
        </Box>

        {/* 🛍️ Product Grid */}
        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4, lg: 6 },
            py: 4,
          }}
        >
          {products.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
              No products found for this category.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: 2.5,
                justifyItems: "center",
                alignItems: "start",
              }}
            >
              {products.map((product) => (
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
    </Box>
  );
};

export default CategoryProducts;
