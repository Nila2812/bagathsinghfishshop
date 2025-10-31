import React, { useState } from "react";
import { Box } from "@mui/material";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [cart, setCart] = useState({});

  const sampleProducts = [
    {
      id: 1,
      name: "Chicken Curry Cut",
      price: 309,
      weight: "960 - 1000g",
      image: "https://www.themealdb.com/images/ingredients/Chicken.png",
    },
    {
      id: 2,
      name: "Freshwater Pomfret",
      price: 159,
      weight: "350 - 490g",
      image: "https://www.themealdb.com/images/ingredients/Fish.png",
    },
    {
      id: 3,
      name: "Prawns Medium",
      price: 209,
      weight: "240 - 270g",
      image: "https://www.themealdb.com/images/ingredients/Shrimp.png",
    },
  ];

  const handleUpdateQuantity = (id, quantity) => {
    setCart((prev) => {
      const updated = { ...prev, [id]: quantity };
      if (quantity === 0) delete updated[id]; // remove when quantity is 0
      return updated;
    });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 3,
        justifyContent: "center",
        p: 4,
      }}
    >
      {sampleProducts.map((item) => (
        <ProductCard
          key={item.id}
          product={item}
          onUpdateQuantity={handleUpdateQuantity}
        />
      ))}
    </Box>
  );
};

export default ProductList;
