import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

const HomeCategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const catRes = await axios.get("http://localhost:5000/api/category");
        const allCategories = catRes.data.filter((cat) => !cat.parentCategory);

        const productsData = {};
        for (const cat of allCategories) {
          const prodRes = await axios.get(
            `http://localhost:5000/api/products/by-category/${cat._id}`
          );
          productsData[cat._id] = prodRes.data.map((p) => ({
            _id: p._id,
            name: p.name_en || p.name,
            price: p.price,
            weight: `${p.weightValue || ""} ${p.weightUnit || ""}`,
            image:
              p.image?.data
                ? `data:${p.image.contentType};base64,${p.image.data}`
                : p.image?.url || p.image || "/placeholder.png",
          }));
        }

        const sortedCategories = allCategories
          .map((cat) => ({
            ...cat,
            productCount: productsData[cat._id]?.length || 0,
          }))
          .sort((a, b) => b.productCount - a.productCount);

        const topCategories = sortedCategories.slice(0, 3);

        setCategories(topCategories);
        setProductsByCategory(productsData);
      } catch (error) {
        console.error("Error fetching category or product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 1, sm: 2, md: 6, lg:5.5 } }}>
      {categories.map((category) => {
        const products = productsByCategory[category._id] || [];

        // Always take up to 5 spaces (for layout consistency)
        const displayedProducts = products.slice(0, 5);
        const emptySlots = 5 - displayedProducts.length;

        return (
          <Box
            key={category._id}
            sx={{
              mt: 6,
              width: "100%",
            }}
          >
            {/* 🏷️ Category Title */}
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: "bold",
                textTransform: "capitalize",
                color: "#7d221d",
                ml: { xs: 1, md: 0 },
              }}
            >
              {category.name_en || category.name}
            </Typography>

            {/* 🛍️ Responsive Scrollable Product Section */}
            <Box
              sx={{
                display: "flex",
                overflowX: { xs: "auto", md: "visible" },
                scrollSnapType: { xs: "x mandatory", md: "none" },
                gap:{xs:1.5 , md:2.0,sm:1.5, lg:2.5},
                justifyContent: { xs: "flex-start", md: "space-between" },
                pb: { xs: 1, md: 0 },
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {/* 🧩 Render products */}
              {displayedProducts.map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    flex: { xs: "0 0 45%", sm: "0 0 30%", md: "0 0 18%" }, // 2 visible on mobile, 5 per row on desktop
                    scrollSnapAlign: "start",
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => {}}
                    onUpdateCart={() => {}}
                    isCompact // optional flag for mobile scaling
                  />
                </Box>
              ))}

              {/* 🕳️ Empty placeholders to preserve even spacing for <5 products */}
              {Array.from({ length: emptySlots }).map((_, idx) => (
                <Box
                  key={`empty-${idx}`}
                  sx={{
                    flex: { xs: "0 0 45%", sm: "0 0 30%", md: "0 0 18%" },
                    scrollSnapAlign: "start",
                  }}
                />
              ))}
            </Box>

            {/* 🔗 View All Button */}
            {products.length > 5 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  size="small"
                  sx={{
                    color: "#e23a3a",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => navigate(`/category/${category._id}`)}
                >
                  View All →
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default HomeCategorySection;
