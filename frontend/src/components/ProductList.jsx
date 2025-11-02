import React, { useState } from "react";
import { Grid } from "@mui/material";
import ProductCard from "./ProductCard";

const ProductList = () => {
  // 🧠 Sample Data (Replace later with data from DB)
  const products = [
    {
      id: 1,
      name: "Chicken Curry Cut",
      price: 309,
      weight: "960-1000 gms",
      image: "https://www.themealdb.com/images/ingredients/Chicken.png",
    },
    {
      id: 2,
      name: "Freshwater Pomfret",
      price: 159,
      weight: "500-700 gms",
      image: "https://www.themealdb.com/images/ingredients/Fish.png",
    },
    {
      id: 3,
      name: "Chicken Boneless",
      price: 294,
      weight: "480-500 gms",
      image: "https://www.themealdb.com/images/ingredients/Chicken%20Breast.png",
    },
  ];

  const [cart, setCart] = useState([]);

  const handleAddToCart = (product, add) => {
    if (add) {
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    } else {
      setCart((prev) => prev.filter((item) => item.id !== product.id));
    }
  };

  const handleUpdateCart = (product, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {products.map((product) => (
        <Grid item key={product.id}>
          <ProductCard
            product={product}
            onAddToCart={handleAddToCart}
            onUpdateCart={handleUpdateCart}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
