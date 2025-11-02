import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ProductCard = ({ product, onAddToCart, onUpdateCart }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onUpdateCart(product, newQty);
  };

  const handleRemove = () => {
    const newQty = quantity - 1;
    if (newQty <= 0) {
      setQuantity(0);
      onAddToCart(product, false);
    } else {
      setQuantity(newQty);
      onUpdateCart(product, newQty);
    }
  };

  const handleAddToCart = () => {
    setQuantity(1);
    onAddToCart(product, true);
  };

  return (
    <Card
      sx={{
        width: 240,
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        p: 1,
        backgroundColor: "white",
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={product.image}
        alt={product.name}
        sx={{ borderRadius: 2 }}
      />
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "black" }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.weight} | ₹{product.price}
        </Typography>

        {quantity === 0 ? (
          <Button
            variant="contained"
            onClick={handleAddToCart}
            sx={{
              mt: 1,
              backgroundColor: "#e23a3a",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#cc3232" },
            }}
          >
            Add to Cart
          </Button>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 1,
            }}
          >
            <IconButton onClick={handleRemove}>
              <RemoveIcon />
            </IconButton>
            <Typography variant="body1" sx={{ mx: 1 }}>
              {quantity}
            </Typography>
            <IconButton onClick={handleAdd}>
              <AddIcon />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
