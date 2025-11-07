import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Button } from "@mui/material";
import ProductCard from "../components/ProductCard";

const CategoriesPage = ({ category, products, onAddToCart, onUpdateCart }) => {
  const navigate = useNavigate();
  const displayedProducts = products.slice(0, 4);

  return (
    <Box sx={{ mb: 6, px: { xs: 2, md: 6 } }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, fontWeight: "bold", color: "#333" }}
      >
        {category.name}
      </Typography>

      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {displayedProducts.map((product) => (
          <Grid item key={product._id || product.code}>
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onUpdateCart={onUpdateCart}
            />
          </Grid>
        ))}
      </Grid>

      {products.length > 4 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate(`/category/${category._id}`)}
            sx={{
              color: "#e23a3a",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            View All →
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesPage;
