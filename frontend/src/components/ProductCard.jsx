import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
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
        width: "100%",
        maxWidth: 180, // card auto fits in grid
        borderRadius: 2,
        boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        p: 0.5,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 6px 14px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
        sx={{
          borderRadius: 2,
          objectFit: "cover",
          width: "100%",
          height: { xs: 100, sm: 130 },
        }}
      />

      <CardContent sx={{ p: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            color: "black",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.8em",
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
        >
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
              fontSize: "0.75rem",
              py: 0.5,
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
            <IconButton size="small" onClick={handleRemove}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 1 }}>
              {quantity}
            </Typography>
            <IconButton size="small" onClick={handleAdd}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
